# 🔧 WebSocket & MinIO Troubleshooting Guide

## 🚨 **Common Issues & Solutions**

### **🔌 WebSocket Issues**

#### **Problem 1: WebSocket Connection Refused**
```
WebSocket connection to 'wss://bookswaps.co.ke/ws/notifications/' failed
```

**Solutions:**
1. **Check Redis Connection**
   ```bash
   docker compose exec redis redis-cli ping
   ```

2. **Verify Daphne is Running**
   ```bash
   docker compose logs backend | grep -i daphne
   ```

3. **Test WebSocket Endpoint**
   ```bash
   python scripts/test-websockets.py
   ```

#### **Problem 2: WebSocket Connects but No Messages**
**Solutions:**
1. **Check Channel Layer Configuration**
   - Ensure Redis URL matches in `.env` and `settings.py`
   - Current setting: `redis://redis:6379/0`

2. **Verify User Authentication**
   - WebSockets require valid JWT token
   - Check token in browser DevTools

#### **Problem 3: WebSocket Disconnects Frequently**
**Solutions:**
1. **Increase Nginx Timeouts**
   - Already configured in `nginx.prod.conf`
   - `proxy_read_timeout 300s`

2. **Check Network Stability**
   - Monitor connection in browser DevTools

---

### **🗄️ MinIO Issues**

#### **Problem 1: MinIO Not Available**
```
⚠️ MinIO not available, using local storage
```

**Solutions:**
1. **Check MinIO Service**
   ```bash
   docker compose ps minio
   docker compose logs minio
   ```

2. **Verify Environment Variables**
   ```bash
   # Check these in .env file:
   MINIO_ACCESS_KEY=bookswaps_admin_2025
   MINIO_SECRET_KEY=BookSwapsMinIOSecureKey2025!
   MINIO_BUCKET_NAME=bookswaps-prod
   MINIO_ENDPOINT_URL=https://bookswaps.co.ke:9000
   ```

3. **Initialize MinIO Bucket**
   ```bash
   docker compose up minio-init
   ```

#### **Problem 2: MinIO Connection Timeout**
**Solutions:**
1. **Check MinIO Health**
   ```bash
   curl -f http://localhost:9000/minio/health/live
   ```

2. **Restart MinIO Service**
   ```bash
   docker compose restart minio
   ```

#### **Problem 3: Images Not Loading**
**Solutions:**
1. **Check Bucket Policy**
   ```bash
   docker compose exec minio-init mc policy get local/bookswaps-prod
   ```

2. **Verify File Upload**
   ```bash
   # Check MinIO console at http://localhost:9001
   # Login with MINIO_ACCESS_KEY and MINIO_SECRET_KEY
   ```

---

## 🛠️ **Quick Fixes**

### **Restart All Services**
```bash
docker compose down
docker compose up -d --build
```

### **Reset MinIO**
```bash
docker compose down
docker volume rm book_swap_minio_data
docker compose up -d minio
docker compose up minio-init
```

### **Reset Redis (WebSockets)**
```bash
docker compose restart redis
docker compose restart backend
```

### **Check All Service Health**
```bash
docker compose ps
docker compose logs --tail=50 backend
docker compose logs --tail=50 minio
docker compose logs --tail=50 redis
```

---

## 🔍 **Debugging Commands**

### **WebSocket Debugging**
```bash
# Test WebSocket connection
python scripts/test-websockets.py

# Check Redis connection
docker compose exec redis redis-cli ping

# Monitor WebSocket traffic
docker compose logs -f backend | grep -i websocket
```

### **MinIO Debugging**
```bash
# Check MinIO status
curl -I http://localhost:9000/minio/health/live

# List buckets
docker compose exec minio-init mc ls local/

# Check bucket policy
docker compose exec minio-init mc policy get local/bookswaps-prod

# Upload test file
echo "test" | docker compose exec -T minio-init mc pipe local/bookswaps-prod/test.txt
```

---

## 📊 **Monitoring**

### **Real-time Logs**
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f minio
docker compose logs -f redis
```

### **Health Checks**
```bash
# Backend health
curl http://localhost:8000/api/health/

# MinIO health
curl http://localhost:9000/minio/health/live

# Redis health
docker compose exec redis redis-cli ping
```

---

## 🚀 **Production Deployment**

### **Pre-deployment Checklist**
- [ ] Update environment variables for new domain
- [ ] Test WebSocket connectivity
- [ ] Verify MinIO bucket creation
- [ ] Check SSL certificates
- [ ] Test file upload/download

### **Post-deployment Verification**
```bash
# Test WebSocket
wscat -c wss://bookswaps.co.ke/ws/notifications/

# Test MinIO
curl -I https://bookswaps.co.ke:9000/minio/health/live

# Test file access
curl -I https://bookswaps.co.ke:9000/bookswaps-prod/test.txt
```

---

## 📞 **Getting Help**

If issues persist:
1. Run the test script: `python scripts/test-websockets.py`
2. Check service logs: `docker compose logs`
3. Verify environment variables match between local and production
4. Ensure DNS is properly configured for the new domain

**Common Environment Mismatches:**
- Redis database number (should be 0)
- MinIO environment variable names (MINIO_ROOT_USER vs MINIO_ACCESS_KEY)
- WebSocket URLs (should use new domain)
- SSL/TLS settings for production

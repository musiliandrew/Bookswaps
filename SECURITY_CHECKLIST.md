# 🔒 BookSwaps Security Checklist - Pre-Production

## ⚠️ CRITICAL SECURITY FIXES REQUIRED

### 1. **Environment Variables & Secrets**
- [ ] **Generate strong SECRET_KEY** (50+ characters, random)
  ```bash
  python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
  ```
- [ ] **Set DEBUG=False** in production
- [ ] **Configure strong database password** (32+ characters)
- [ ] **Set strong MinIO credentials** (32+ characters each)
- [ ] **Configure production email credentials**
- [ ] **Set up Google OAuth production credentials**
- [ ] **Configure Google Maps API key**

### 2. **CORS & Host Configuration**
- [ ] **Remove CORS_ALLOW_ALL_ORIGINS = True**
- [ ] **Set specific ALLOWED_HOSTS** (remove "*")
- [ ] **Configure specific CORS_ALLOWED_ORIGINS**
- [ ] **Set proper FRONTEND_URL**

### 3. **HTTPS & SSL Configuration**
- [ ] **Enable SSL/TLS certificates**
- [ ] **Configure SECURE_SSL_REDIRECT = True**
- [ ] **Set SECURE_PROXY_SSL_HEADER**
- [ ] **Enable HSTS headers**
- [ ] **Configure secure cookies**

### 4. **Database Security**
- [ ] **Enable SSL for database connections**
- [ ] **Use connection pooling**
- [ ] **Set up database backups**
- [ ] **Configure database user with minimal privileges**

### 5. **File Storage Security**
- [ ] **Set AWS_DEFAULT_ACL = 'private'** for sensitive files
- [ ] **Enable SSL for MinIO/S3**
- [ ] **Configure proper bucket policies**
- [ ] **Set file upload size limits**

### 6. **Authentication & Authorization**
- [ ] **Reduce JWT token lifetime** (15 minutes access, 7 days refresh)
- [ ] **Enable mandatory email verification**
- [ ] **Configure stricter password validation**
- [ ] **Set up rate limiting for auth endpoints**

### 7. **Rate Limiting & DDoS Protection**
- [ ] **Configure API rate limiting**
- [ ] **Set up Axes for brute force protection**
- [ ] **Implement request throttling**
- [ ] **Configure fail2ban or similar**

### 8. **Logging & Monitoring**
- [ ] **Set up production logging**
- [ ] **Configure error tracking (Sentry)**
- [ ] **Set up monitoring (Prometheus/Grafana)**
- [ ] **Configure log rotation**

### 9. **Security Headers**
- [ ] **X-Frame-Options: DENY**
- [ ] **X-Content-Type-Options: nosniff**
- [ ] **X-XSS-Protection: 1; mode=block**
- [ ] **Referrer-Policy: strict-origin-when-cross-origin**
- [ ] **Content-Security-Policy**

### 10. **Input Validation & Sanitization**
- [ ] **Validate all user inputs**
- [ ] **Sanitize file uploads**
- [ ] **Implement CSRF protection**
- [ ] **Validate API parameters**

## 🛡️ PRODUCTION DEPLOYMENT STEPS

### 1. **Environment Setup**
```bash
# Copy production environment template
cp .env.production .env

# Edit with your production values
nano .env

# Generate strong secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 2. **Database Migration**
```bash
# Use production settings
export DJANGO_SETTINGS_MODULE=backend.settings_production

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

### 3. **Static Files**
```bash
# Collect static files
python manage.py collectstatic --noinput
```

### 4. **SSL Certificate Setup**
```bash
# Using Let's Encrypt (example)
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 5. **Nginx Configuration**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    
    location / {
        proxy_pass http://frontend:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔍 SECURITY TESTING

### 1. **Automated Security Scans**
```bash
# Install security tools
pip install bandit safety

# Run security scan
bandit -r backend/
safety check

# Check for vulnerabilities
npm audit
```

### 2. **Manual Security Tests**
- [ ] **Test authentication bypass**
- [ ] **Test SQL injection**
- [ ] **Test XSS vulnerabilities**
- [ ] **Test CSRF protection**
- [ ] **Test file upload security**
- [ ] **Test rate limiting**

### 3. **Penetration Testing**
- [ ] **OWASP ZAP scan**
- [ ] **Nmap port scan**
- [ ] **SSL/TLS configuration test**
- [ ] **Load testing**

## 🚨 INCIDENT RESPONSE PLAN

### 1. **Security Breach Response**
- [ ] **Immediate containment procedures**
- [ ] **User notification process**
- [ ] **Data breach reporting**
- [ ] **Recovery procedures**

### 2. **Monitoring & Alerts**
- [ ] **Failed login attempts**
- [ ] **Unusual API usage**
- [ ] **File upload anomalies**
- [ ] **Database connection issues**

## 📋 COMPLIANCE CHECKLIST

### 1. **Data Protection**
- [ ] **GDPR compliance** (if applicable)
- [ ] **Data retention policies**
- [ ] **User data deletion**
- [ ] **Privacy policy**

### 2. **Terms of Service**
- [ ] **User agreement**
- [ ] **Content policies**
- [ ] **Liability limitations**
- [ ] **Dispute resolution**

## ✅ FINAL SECURITY VERIFICATION

Before going live, ensure ALL items above are completed and tested.

### Quick Security Test Commands:
```bash
# Test SSL configuration
curl -I https://yourdomain.com

# Test security headers
curl -I https://yourdomain.com | grep -E "(X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security)"

# Test API rate limiting
for i in {1..10}; do curl -X POST https://yourdomain.com/api/users/login/; done
```

## 🆘 EMERGENCY CONTACTS

- **System Administrator**: [contact info]
- **Security Team**: [contact info]
- **Hosting Provider**: [contact info]
- **SSL Certificate Provider**: [contact info]

---

**⚠️ WARNING: Do not deploy to production until ALL security items are addressed!**

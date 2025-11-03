# Production Deployment Notes

## Key Changes Made to Fix SSL Issues

### Problem Summary
The websites bookswaps.co.ke and quantiq.co.ke were inaccessible due to:
1. Nginx service was stopped
2. Docker containers had port conflicts with system nginx
3. SSL certificates existed but nginx couldn't access them
4. BookSwaps containers weren't properly exposing ports
5. **API endpoints returning 404** - nginx was stripping `/api/` from URLs
6. **Google OAuth failing with 400 errors** - serializer validation issue

### Solution Applied

#### 1. System Nginx Configuration
- System nginx now handles SSL termination at `/etc/nginx/sites-available/bookswaps.co.ke`
- SSL certificates are managed by Let's Encrypt and are valid until October 2025
- **FIXED**: API proxy configuration now correctly preserves `/api/` path
- Nginx proxies requests to Docker containers:
  - Frontend: `localhost:3000`
  - Backend API: `localhost:8000/api/` (preserves full path)

#### 2. Docker Compose Changes
- **Removed nginx container** from docker-compose.prod.yml to avoid port conflicts
- **Changed frontend port** from 5173 to 3000 for production
- **Simplified configuration** to match working server setup
- **Removed MinIO external ports** for security (accessed internally only)

#### 3. Backend Code Fixes
- **Fixed GoogleAuthSerializer** - replaced direct `validated_data` assignment with instance variable
- **Updated GoogleAuthView** - now properly retrieves Google user data
- **Synchronized environment variables** - Google OAuth credentials match between local and server

#### 4. Files Modified

**docker-compose.yml** (Development):
- Removed nginx service (system nginx handles SSL)
- Changed frontend port to 3000
- Simplified configuration

**docker-compose.prod.yml** (Production):
- Matches exactly what's working on the server
- No nginx container (system nginx handles SSL)
- Frontend on port 3000, backend on port 8000
- Network name: `bookswaps_network`

**backend/users/serializers.py**:
- Fixed GoogleAuthSerializer validation issue
- Added proper Google user data handling

**backend/users/views.py**:
- Updated GoogleAuthView to use new serializer method

**nginx/bookswaps.co.ke.conf**:
- System nginx configuration template
- Correct API proxy configuration

### Current Working Configuration

#### System Nginx (/etc/nginx/sites-available/bookswaps.co.ke):
```nginx
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name bookswaps.co.ke www.bookswaps.co.ke;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name bookswaps.co.ke www.bookswaps.co.ke;

    ssl_certificate /etc/letsencrypt/live/bookswaps.co.ke/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/bookswaps.co.ke/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Docker Services Running:
- **Frontend**: Port 3000 (nginx proxies to this)
- **Backend**: Port 8000 (nginx proxies /api/ to this)
- **Database**: Internal only
- **Redis**: Internal only
- **MinIO**: Internal only

### Deployment Instructions

1. **Push changes to GitHub**:
   ```bash
   git add .
   git commit -m "Fix production deployment configuration"
   git push origin main
   ```

2. **Deploy on server**:
   ```bash
   cd /opt/bookswaps
   git pull origin main
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. **Verify services**:
   ```bash
   # Check containers
   docker ps
   
   # Check nginx
   sudo systemctl status nginx
   
   # Test websites
   curl -I https://bookswaps.co.ke
   curl -I https://quantiq.co.ke
   ```

### Important Notes

- **System nginx must remain running** for SSL termination
- **SSL certificates auto-renew** via Let's Encrypt
- **No port conflicts** between Docker and system services
- **Both domains working** with valid HTTPS certificates
- **All services accessible** internally within Docker network

### Troubleshooting

If issues occur after deployment:
1. Check nginx status: `sudo systemctl status nginx`
2. Check Docker containers: `docker ps`
3. Check port bindings: `netstat -tlnp | grep -E ":(3000|8000)"`
4. Check SSL certificates: `sudo certbot certificates`
5. Restart services if needed:
   ```bash
   sudo systemctl restart nginx
   docker-compose -f docker-compose.prod.yml restart
   ```

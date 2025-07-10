#!/bin/bash

# SSL Certificate Setup Script for BookSwaps
# Sets up Let's Encrypt SSL certificates for bookswaps.co.ke

set -e

echo "🔒 BookSwaps SSL Certificate Setup"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Configuration
DOMAIN="bookswaps.co.ke"
WWW_DOMAIN="www.bookswaps.co.ke"
EMAIL="andrewthepyrookie@gmail.com"
CERT_DIR="/etc/letsencrypt"
NGINX_CONF_DIR="./nginx"

# Step 1: Install Certbot
log_info "Step 1: Installing Certbot"

if ! command -v certbot &> /dev/null; then
    log_info "Installing Certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
    log_success "Certbot installed"
else
    log_success "Certbot already installed"
fi

# Step 2: Stop nginx temporarily
log_info "Step 2: Stopping nginx for certificate generation"

docker compose stop nginx || log_warning "Nginx was not running"

# Step 3: Generate SSL certificates
log_info "Step 3: Generating SSL certificates"

log_info "Generating certificate for $DOMAIN and $WWW_DOMAIN"

if sudo certbot certonly \
    --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --domains $DOMAIN,$WWW_DOMAIN; then
    log_success "SSL certificates generated successfully"
else
    log_error "SSL certificate generation failed"
    exit 1
fi

# Step 4: Create nginx SSL configuration
log_info "Step 4: Creating nginx SSL configuration"

# Create SSL-enabled nginx configuration
cat > "$NGINX_CONF_DIR/nginx.conf" << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
    
    # Basic settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
    # Upstream servers
    upstream backend {
        server backend:8000;
    }
    
    upstream frontend {
        server frontend:3000;
    }
    
    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name bookswaps.co.ke www.bookswaps.co.ke;
        
        # Let's Encrypt challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        # Redirect all other traffic to HTTPS
        location / {
            return 301 https://$server_name$request_uri;
        }
    }
    
    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name bookswaps.co.ke www.bookswaps.co.ke;
        
        # SSL configuration
        ssl_certificate /etc/letsencrypt/live/bookswaps.co.ke/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/bookswaps.co.ke/privkey.pem;
        
        # SSL settings
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
        
        # Authentication endpoints with stricter rate limiting
        location ~ ^/api/(auth|users)/(login|register|google) {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # WebSocket connections
        location /ws/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 300s;
            proxy_buffering off;
        }
        
        # Django admin
        location /admin/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Static files
        location /static/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Media files
        location /media/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            expires 1y;
            add_header Cache-Control "public";
        }
        
        # Frontend application
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Handle client-side routing
            try_files $uri $uri/ @fallback;
        }
        
        location @fallback {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

log_success "SSL nginx configuration created"

# Step 5: Update docker-compose to mount SSL certificates
log_info "Step 5: Updating docker-compose for SSL"

# The docker-compose.yml should already have the SSL volume mounts
# Just verify they exist

if grep -q "letsencrypt" docker-compose.yml; then
    log_success "SSL volume mounts already configured in docker-compose.yml"
else
    log_warning "SSL volume mounts not found in docker-compose.yml"
    log_info "Please add the following to nginx service volumes:"
    echo "      - /etc/letsencrypt:/etc/letsencrypt:ro"
fi

# Step 6: Start nginx with SSL
log_info "Step 6: Starting nginx with SSL"

docker compose up -d nginx

# Wait for nginx to start
sleep 5

if docker compose ps nginx | grep -q "Up"; then
    log_success "Nginx started with SSL configuration"
else
    log_error "Nginx failed to start"
    docker compose logs nginx
    exit 1
fi

# Step 7: Set up automatic certificate renewal
log_info "Step 7: Setting up automatic certificate renewal"

# Create renewal script
cat > /tmp/renew-ssl.sh << 'EOF'
#!/bin/bash
# SSL Certificate Renewal Script

# Stop nginx
docker compose -f /home/musili/BookSwaps/docker-compose.yml stop nginx

# Renew certificates
certbot renew --quiet

# Start nginx
docker compose -f /home/musili/BookSwaps/docker-compose.yml start nginx
EOF

sudo mv /tmp/renew-ssl.sh /usr/local/bin/renew-ssl.sh
sudo chmod +x /usr/local/bin/renew-ssl.sh

# Add to crontab
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/local/bin/renew-ssl.sh") | crontab -

log_success "Automatic certificate renewal configured"

echo ""
log_success "🎉 SSL setup completed!"
echo ""
log_info "Your site is now available at:"
echo "  - https://bookswaps.co.ke"
echo "  - https://www.bookswaps.co.ke"
echo ""
log_info "SSL certificates will auto-renew via cron job"
log_info "Certificate location: /etc/letsencrypt/live/bookswaps.co.ke/"

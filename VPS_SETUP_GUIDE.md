# 🚀 BookSwaps VPS Setup & CI/CD Guide

> **Complete guide for setting up BookSwaps on your VPS with GitHub Actions CI/CD**

---

## 📋 **Prerequisites**

### **VPS Requirements:**
- **OS:** Ubuntu 20.04+ or Debian 11+
- **RAM:** Minimum 4GB (8GB recommended)
- **Storage:** Minimum 50GB SSD
- **CPU:** 2+ cores
- **Network:** Public IP address

### **Domain & DNS:**
- Domain name pointing to your VPS IP
- SSL certificate (Let's Encrypt recommended)

---

## 🔧 **VPS Initial Setup**

### **1. Connect to Your VPS**
```bash
ssh root@your-vps-ip
# or
ssh your-username@your-vps-ip
```

### **2. Update System**
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git unzip
```

### **3. Create Application User**
```bash
sudo adduser bookswaps
sudo usermod -aG sudo bookswaps
sudo su - bookswaps
```

### **4. Install Docker & Docker Compose**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### **5. Setup Firewall**
```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## 🔑 **GitHub Actions Setup**

### **1. Generate SSH Key for Deployment**
```bash
# On your VPS
ssh-keygen -t ed25519 -C "github-actions-bookswaps" -f ~/.ssh/github_actions
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_actions  # Copy this private key
```

### **2. Configure GitHub Secrets**

Go to your GitHub repository → Settings → Secrets and variables → Actions

**Add these secrets:**

```bash
# VPS Connection
VPS_HOST=your-vps-ip-or-domain
VPS_USER=bookswaps
VPS_SSH_KEY=<paste-private-key-from-step-1>

# Database Configuration
DATABASE_URL=postgresql://bookswaps:your-secure-password@postgres:5432/bookswaps
POSTGRES_PASSWORD=your-secure-postgres-password

# Redis Configuration
REDIS_URL=redis://:your-redis-password@redis:6379/0
REDIS_PASSWORD=your-secure-redis-password

# Django Configuration
SECRET_KEY=your-very-long-and-secure-secret-key-here
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Email Configuration (Gmail example)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# MinIO Configuration
MINIO_ACCESS_KEY=your-minio-access-key
MINIO_SECRET_KEY=your-minio-secret-key

# GitHub Token (automatically provided)
GITHUB_TOKEN=<automatically-provided>
```

### **3. Environment Variables Guide**

**SECRET_KEY Generation:**
```python
# Run this in Python to generate a secure secret key
import secrets
print(secrets.token_urlsafe(50))
```

**Gmail App Password:**
1. Enable 2FA on your Gmail account
2. Go to Google Account settings
3. Generate an "App Password" for Django
4. Use this password in `EMAIL_HOST_PASSWORD`

---

## 🏗️ **VPS Application Setup**

### **1. Initial Deployment**
```bash
# On your VPS
sudo mkdir -p /opt/bookswaps
sudo chown bookswaps:bookswaps /opt/bookswaps
cd /opt/bookswaps

# Clone repository
git clone https://github.com/musiliandrew/Bookswaps.git .

# Copy environment file
cp .env.production.example .env.production

# Edit environment file with your values
nano .env.production
```

### **2. Environment Configuration**
```bash
# .env.production file content
DOMAIN_NAME=your-domain.com
POSTGRES_PASSWORD=your-secure-postgres-password
REDIS_PASSWORD=your-secure-redis-password
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
MINIO_ACCESS_KEY=your-minio-access-key
MINIO_SECRET_KEY=your-minio-secret-key
```

### **3. SSL Certificate Setup**

**Option A: Let's Encrypt (Recommended)**
```bash
# Install certbot
sudo apt install -y certbot

# Generate certificate
sudo certbot certonly --standalone \
  --email your-email@domain.com \
  --agree-tos \
  --no-eff-email \
  -d your-domain.com

# Copy certificates
sudo mkdir -p /opt/bookswaps/ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /opt/bookswaps/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem /opt/bookswaps/ssl/
sudo chown bookswaps:bookswaps /opt/bookswaps/ssl/*

# Setup auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f /opt/bookswaps/docker-compose.prod.yml restart nginx" | sudo crontab -
```

**Option B: Custom Certificates**
```bash
# Place your certificates in:
# /opt/bookswaps/ssl/fullchain.pem
# /opt/bookswaps/ssl/privkey.pem
```

### **4. Initial Deployment**
```bash
cd /opt/bookswaps

# Run the deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

## 🔄 **CI/CD Workflow**

### **How It Works:**

1. **Push to main branch** → Triggers CI/CD pipeline
2. **Frontend Tests** → ESLint, unit tests, build
3. **Backend Tests** → Django tests with PostgreSQL
4. **Security Scan** → Trivy vulnerability scanning
5. **Build Images** → Docker images pushed to GitHub Container Registry
6. **Deploy to VPS** → Automated deployment with zero downtime
7. **Health Checks** → Verify deployment success

### **Manual Deployment Trigger:**
```bash
# Force deployment without code changes
git commit --allow-empty -m "trigger deployment"
git push origin main
```

---

## 📊 **Monitoring & Maintenance**

### **1. View Application Logs**
```bash
cd /opt/bookswaps

# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### **2. Database Management**
```bash
# Access database
docker-compose -f docker-compose.prod.yml exec postgres psql -U bookswaps -d bookswaps

# Create database backup
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U bookswaps bookswaps > backup.sql

# Restore database
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U bookswaps -d bookswaps < backup.sql
```

### **3. Application Management**
```bash
# Restart services
docker-compose -f docker-compose.prod.yml restart

# Update application (manual)
git pull origin main
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=2
```

### **4. System Monitoring**
```bash
# Check system resources
htop
df -h
free -h

# Check Docker resources
docker stats
docker system df
```

---

## 🔧 **Troubleshooting**

### **Common Issues:**

**1. SSL Certificate Issues**
```bash
# Check certificate validity
openssl x509 -in /opt/bookswaps/ssl/fullchain.pem -text -noout

# Renew Let's Encrypt certificate
sudo certbot renew --dry-run
```

**2. Database Connection Issues**
```bash
# Check database status
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U bookswaps

# Reset database password
docker-compose -f docker-compose.prod.yml exec postgres psql -U postgres -c "ALTER USER bookswaps PASSWORD 'new-password';"
```

**3. Memory Issues**
```bash
# Check memory usage
free -h
docker stats

# Restart services to free memory
docker-compose -f docker-compose.prod.yml restart
```

**4. Disk Space Issues**
```bash
# Check disk usage
df -h
docker system df

# Clean up Docker
docker system prune -a
docker volume prune
```

---

## 🚀 **Performance Optimization**

### **1. Enable Monitoring**
```bash
# Start monitoring stack
docker-compose -f docker-compose.prod.yml --profile monitoring up -d

# Access Grafana
# http://your-domain.com:3000
# Username: admin
# Password: your-grafana-password
```

### **2. Database Optimization**
```bash
# Optimize PostgreSQL
docker-compose -f docker-compose.prod.yml exec postgres psql -U bookswaps -d bookswaps -c "VACUUM ANALYZE;"
```

### **3. Backup Automation**
```bash
# Setup automated backups
crontab -e

# Add this line for daily backups at 2 AM
0 2 * * * cd /opt/bookswaps && docker-compose -f docker-compose.prod.yml run --rm backup
```

---

## 🔐 **Security Best Practices**

### **1. Regular Updates**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### **2. Firewall Configuration**
```bash
# Check firewall status
sudo ufw status

# Allow specific IPs only (optional)
sudo ufw allow from your-office-ip to any port 22
```

### **3. Backup Strategy**
- **Daily automated backups**
- **Weekly full system backups**
- **Monthly backup verification**
- **Offsite backup storage (S3)**

---

## 📞 **Support & Maintenance**

### **Regular Maintenance Tasks:**
- [ ] **Weekly:** Check logs and system resources
- [ ] **Monthly:** Update system packages and Docker images
- [ ] **Quarterly:** Review and rotate secrets
- [ ] **Annually:** Renew SSL certificates (if not automated)

### **Emergency Procedures:**
1. **Service Down:** Check logs, restart services
2. **Database Issues:** Restore from latest backup
3. **Security Breach:** Rotate all secrets, check logs
4. **Performance Issues:** Scale services, optimize database

---

**🎉 Your BookSwaps application is now running on a professional VPS with automated CI/CD deployment!**

**Access your application at: `https://your-domain.com`**

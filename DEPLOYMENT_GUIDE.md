# 🚀 BookSwaps Production Deployment Guide

> **Complete guide for deploying BookSwaps to your VPS with GitHub Actions CI/CD**

---

## 📋 **Prerequisites**

### **VPS Requirements:**
- **Ubuntu 20.04+** ✅ (You have this)
- **Docker & Docker Compose** ✅ (You have this)
- **Nginx** ✅ (You have this)
- **Domain:** bookswaps.quantiq.co.ke ✅ (You have this)
- **IP:** 178.32.191.152 ✅ (You have this)

---

## 🔧 **Step 1: Configure GitHub Secrets**

Go to your GitHub repository → Settings → Secrets and variables → Actions

**Add these secrets:**

```
VPS_HOST = 178.32.191.152
VPS_USERNAME = ubuntu
VPS_PASSWORD = *Musili2025
EMAIL_PASSWORD = your_gmail_app_password
```

### **How to get Gmail App Password:**
1. Go to Google Account settings
2. Security → 2-Step Verification (enable if not already)
3. App passwords → Generate password for "Mail"
4. Use this password in EMAIL_PASSWORD secret

---

## 🏗️ **Step 2: Initial VPS Setup**

**SSH into your VPS:**
```bash
ssh ubuntu@178.32.191.152
```

**Run the deployment script:**
```bash
# Download and run the deployment script
curl -fsSL https://raw.githubusercontent.com/musiliandrew/Bookswaps/main/deploy.sh -o deploy.sh
chmod +x deploy.sh
./deploy.sh
```

**This script will:**
- ✅ Update system packages
- ✅ Install Docker, Docker Compose, Nginx, Certbot
- ✅ Configure firewall (UFW)
- ✅ Clone your repository
- ✅ Set up SSL certificates with Let's Encrypt
- ✅ Create production environment
- ✅ Deploy the application

---

## 🌐 **Step 3: DNS Configuration**

**Point your domain to your VPS:**

In your domain registrar (where you bought quantiq.co.ke):

```
A Record:  bookswaps.quantiq.co.ke → 178.32.191.152
A Record:  www.bookswaps.quantiq.co.ke → 178.32.191.152
```

**Wait for DNS propagation (5-30 minutes)**

---

## 🔐 **Step 4: SSL Certificate Setup**

The deployment script automatically sets up SSL certificates, but if you need to do it manually:

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d bookswaps.quantiq.co.ke -d www.bookswaps.quantiq.co.ke

# Set up auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

---

## 🚀 **Step 5: GitHub Actions Deployment**

**Your CI/CD pipeline will:**

1. **Run Tests** - Backend and frontend tests
2. **Build Application** - Create production builds
3. **Deploy to VPS** - Automatic deployment on push to main

**To trigger deployment:**
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

**Monitor deployment:**
- Go to GitHub → Actions tab
- Watch the deployment progress
- Check for any errors

---

## 📊 **Step 6: Verify Deployment**

**Check services are running:**
```bash
cd /opt/bookswaps
docker-compose -f docker-compose.prod.yml ps
```

**Access your application:**
- **Website:** https://bookswaps.quantiq.co.ke
- **Admin Panel:** https://bookswaps.quantiq.co.ke/admin
- **API Health:** https://bookswaps.quantiq.co.ke/api/health/
- **MinIO Console:** https://bookswaps.quantiq.co.ke:9001

**Default credentials:**
- **Admin Username:** admin
- **Admin Password:** BookSwaps2025Admin!

---

## 🔧 **Step 7: Post-Deployment Configuration**

### **Update Environment Variables:**
```bash
cd /opt/bookswaps
nano .env.production
```

**Update these values:**
```env
EMAIL_HOST_PASSWORD=your_actual_gmail_app_password
SECRET_KEY=generate_new_secret_key_here
DB_PASSWORD=change_to_stronger_password
```

### **Restart services after changes:**
```bash
docker-compose -f docker-compose.prod.yml restart
```

### **Create additional admin users:**
```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

---

## 📈 **Step 8: Monitoring & Maintenance**

### **View logs:**
```bash
# All services
docker-compose -f docker-compose.prod.yml logs

# Specific service
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs nginx
```

### **Update application:**
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

### **Backup database:**
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U bookswaps_user bookswaps_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U bookswaps_user bookswaps_prod < backup_file.sql
```

---

## 🔒 **Security Checklist**

### **✅ Completed by deployment script:**
- [x] SSL certificates (HTTPS)
- [x] Firewall configuration
- [x] Security headers in Nginx
- [x] Non-root Docker containers
- [x] Rate limiting

### **🔧 Manual security steps:**

**1. Change default passwords:**
```bash
# Change admin password
docker-compose -f docker-compose.prod.yml exec backend python manage.py changepassword admin

# Update database password in .env.production
# Update MinIO credentials in .env.production
```

**2. Set up fail2ban:**
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

**3. Configure SSH key authentication:**
```bash
# On your local machine
ssh-keygen -t rsa -b 4096
ssh-copy-id ubuntu@178.32.191.152

# On VPS, disable password authentication
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart ssh
```

---

## 🚨 **Troubleshooting**

### **Common Issues:**

**1. SSL Certificate Issues:**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Copy to nginx directory
sudo cp /etc/letsencrypt/live/quantiq.co.ke/* /opt/bookswaps/nginx/ssl/
```

**2. Docker Issues:**
```bash
# Restart Docker
sudo systemctl restart docker

# Clean up Docker
docker system prune -a

# Rebuild containers
docker-compose -f docker-compose.prod.yml up -d --build --force-recreate
```

**3. Database Issues:**
```bash
# Check database logs
docker-compose -f docker-compose.prod.yml logs db

# Reset database (⚠️ This will delete all data)
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

**4. Nginx Issues:**
```bash
# Check nginx configuration
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## 📞 **Support**

**If you encounter issues:**

1. **Check logs:** `docker-compose -f docker-compose.prod.yml logs`
2. **Check GitHub Actions:** Look for failed deployments
3. **Verify DNS:** Ensure domain points to your VPS
4. **Check firewall:** `sudo ufw status`
5. **Verify SSL:** `sudo certbot certificates`

---

## 🎉 **Success Indicators**

**Your deployment is successful when:**

✅ **Website loads:** https://quantiq.co.ke  
✅ **Admin panel works:** https://quantiq.co.ke/admin  
✅ **API responds:** https://quantiq.co.ke/api/health/  
✅ **SSL certificate valid:** Green lock in browser  
✅ **All containers running:** `docker-compose ps` shows all services up  
✅ **GitHub Actions passing:** Green checkmarks in Actions tab  

---

**🚀 Your BookSwaps platform is now live and ready for users!**

*Remember to regularly update your application and monitor the logs for any issues.*

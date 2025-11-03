# 🌐 DNS Setup Guide for BookSwaps

## 📋 **Domain Configuration Options**

You own `quantiq.co.ke` and can choose either option:

---

## **Option 1: Subdomain (Recommended) 🎯**

### **Create: bookswaps.quantiq.co.ke**

**In your domain registrar panel:**

1. **Find "DNS Management" or "DNS Records" section**
2. **Add these A Records:**

```
Type: A Record
Name: bookswaps
Value: 178.32.191.152
TTL: 300 (or Auto/Default)

Type: A Record
Name: www.bookswaps  
Value: 178.32.191.152
TTL: 300 (or Auto/Default)
```

**Result:**
- ✅ Main site: `https://bookswaps.quantiq.co.ke`
- ✅ WWW version: `https://www.bookswaps.quantiq.co.ke`
- ✅ Keeps main domain free for other uses

---

## **Option 2: Main Domain 🏠**

### **Use: quantiq.co.ke directly**

**In your domain registrar panel:**

```
Type: A Record
Name: @ (or leave blank for root)
Value: 178.32.191.152
TTL: 300

Type: A Record
Name: www
Value: 178.32.191.152
TTL: 300
```

**Result:**
- ✅ Main site: `https://quantiq.co.ke`
- ✅ WWW version: `https://www.quantiq.co.ke`

---

## **🔍 How to Find DNS Management**

### **Common Registrar Interfaces:**

**Namecheap:**
- Dashboard → Domain List → Manage → Advanced DNS

**GoDaddy:**
- My Products → Domains → DNS → Manage Zones

**Cloudflare:**
- Dashboard → Domain → DNS → Records

**Generic Steps:**
1. Login to your domain registrar
2. Find your domain `quantiq.co.ke`
3. Look for "DNS", "DNS Management", or "DNS Records"
4. Add the A Records as shown above

---

## **⏱️ DNS Propagation**

**After adding DNS records:**
- **Local:** 5-15 minutes
- **Global:** 15-48 hours (usually within 2 hours)

**Check propagation:**
```bash
# Check if DNS is working
nslookup bookswaps.quantiq.co.ke
# Should return: 178.32.191.152
```

**Online tools:**
- https://dnschecker.org
- https://whatsmydns.net

---

## **📝 Current Configuration**

**The application is currently configured for:**
- `bookswaps.quantiq.co.ke` (Option 1)

**If you prefer Option 2 (main domain), let me know and I'll update all configurations!**

---

## **🚀 Next Steps**

1. **Choose your preferred option**
2. **Add DNS records in your registrar panel**
3. **Wait 15-30 minutes for propagation**
4. **Run the deployment script**

**Need help finding your DNS management panel? Let me know your registrar name!**

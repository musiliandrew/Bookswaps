# 🛠️ BookSwaps Local Development Setup

This guide helps you run BookSwaps locally for development and testing, while keeping your production deployment completely separate and safe.

## 🎯 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git repository cloned locally

### Start Development Environment
```bash
# Make the script executable (first time only)
chmod +x dev-local.sh

# Start all services
./dev-local.sh start
```

### Access Your Local Application
- **🌐 Main Application**: http://localhost
- **🔧 Backend API**: http://localhost/api/
- **📊 Direct Backend**: http://localhost:8000 (for debugging)
- **⚡ Direct Frontend**: http://localhost:5173 (with hot reload)
- **🗄️ MinIO Console**: http://localhost:9001

## 📋 Development Commands

### Basic Operations
```bash
./dev-local.sh start      # Start development environment
./dev-local.sh stop       # Stop development environment
./dev-local.sh restart    # Restart development environment
./dev-local.sh status     # Check service health
```

### Debugging & Logs
```bash
./dev-local.sh logs                # Show all logs
./dev-local.sh logs backend        # Show backend logs only
./dev-local.sh logs frontend       # Show frontend logs only
./dev-local.sh logs nginx          # Show nginx logs only
```

### Database Operations
```bash
./dev-local.sh migrate             # Run database migrations
./dev-local.sh superuser           # Create Django superuser
```

### Cleanup
```bash
./dev-local.sh clean               # Remove all containers and volumes
```

## 🔧 Configuration Files

### Local Development Files (Created for You)
- `docker-compose.dev.yml` - Development overrides
- `nginx/nginx.dev.conf` - Local nginx configuration
- `frontend/.env` - Frontend environment variables (local)
- `.env` - Backend environment variables (updated for local)
- `dev-local.sh` - Development management script

### Production Files (Unchanged)
- `docker-compose.prod.yml` - Production configuration
- `nginx/nginx.prod.conf` - Production nginx configuration
- `.github/workflows/` - CI/CD pipeline (unchanged)

## 🌐 Environment Separation

### Local Development URLs
- Frontend: `http://localhost/api/`
- WebSocket: `ws://localhost:8000`
- MinIO: `http://minio:9000` (internal)

### Production URLs (Unchanged)
- Frontend: `https://bookswaps.quantiq.co.ke/api/`
- WebSocket: `wss://bookswaps.quantiq.co.ke`
- MinIO: Production MinIO endpoint

## 🔄 Development Workflow

1. **Start Development Environment**
   ```bash
   ./dev-local.sh start
   ```

2. **Make Your Changes**
   - Frontend changes auto-reload at http://localhost:5173
   - Backend changes require restart: `./dev-local.sh restart`

3. **Test Your Changes**
   - Access the app at http://localhost
   - Check logs: `./dev-local.sh logs`
   - Monitor status: `./dev-local.sh status`

4. **Commit and Push**
   - Your changes will automatically deploy to production via GitHub Actions
   - Local development environment remains separate

## 🚨 Important Notes

### ✅ Safe Operations
- All local development is isolated from production
- Your production deployment continues to work normally
- GitHub Actions CI/CD pipeline is unchanged
- Production environment variables are untouched

### ⚠️ Development vs Production
- **Local**: Uses HTTP (no SSL)
- **Production**: Uses HTTPS with SSL certificates
- **Local**: More permissive CORS and rate limiting
- **Production**: Strict security headers and rate limiting

### 🔧 Troubleshooting

#### Services Won't Start
```bash
# Check Docker is running
docker info

# Clean and restart
./dev-local.sh clean
./dev-local.sh start
```

#### Frontend Not Loading
```bash
# Check frontend logs
./dev-local.sh logs frontend

# Try direct access
curl http://localhost:5173
```

#### Backend API Issues
```bash
# Check backend logs
./dev-local.sh logs backend

# Test API directly
curl http://localhost:8000/api/health/
```

#### Database Issues
```bash
# Run migrations
./dev-local.sh migrate

# Check database logs
./dev-local.sh logs db
```

## 📝 Development Tips

### Hot Reload
- Frontend changes are automatically reloaded
- Backend changes require container restart
- Database schema changes need migrations

### Debugging
- Backend runs in debug mode (`DEBUG=True`)
- Frontend has development tools enabled
- All services expose ports for direct access

### Testing
- Run tests before pushing to production
- Use local environment to verify features work
- Check both frontend and backend functionality

## 🎉 You're All Set!

Your local development environment is now properly configured and isolated from production. You can safely develop and test locally, then push changes to trigger automatic production deployment.

**Happy coding! 🚀**

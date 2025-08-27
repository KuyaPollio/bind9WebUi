# Production Deployment Fixes

This document outlines the fixes applied to resolve production deployment issues.

## Issues Fixed

### 1. CORS (Cross-Origin Resource Sharing) Errors
**Problem**: Frontend at `http://10.0.0.11:3131` couldn't access backend API due to CORS restrictions.

**Solution**: 
- Updated backend CORS configuration to allow all origins in production
- Added nginx proxy configuration to handle API requests through the same domain
- Set `FRONTEND_URL=*` in docker-compose.prod.yml

### 2. File Permission Errors
**Problem**: Backend couldn't write to `/app/data/users.json` due to permission denied errors.

**Solution**:
- Added `init-permissions` service that runs before other services
- This init container automatically sets up correct directory structure and permissions
- No manual scripts needed - everything is handled by docker-compose

### 3. Network Communication Issues
**Problem**: Services trying to communicate using `localhost` URLs which don't work in Docker containers.

**Solution**:
- Updated nginx configuration to proxy API requests to backend container
- Configured frontend to use relative URLs
- Ensured all services communicate through Docker network

### 4. BIND9 Configuration
**Problem**: BIND9 couldn't find configuration files.

**Solution**:
- Verified volume mounts are correct
- Added proper user permissions for bind9 service
- Added health checks for all services

## Deployment Steps

1. **Create environment file** (optional):
   ```bash
   cp env.example .env
   # Edit .env with your specific values if needed
   ```

2. **Deploy the application** (in Portainer or command line):
   ```bash
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml pull
   docker-compose -f docker-compose.prod.yml up -d
   ```
   
   Or in **Portainer**:
   - Create a new stack
   - Copy the contents of `docker-compose.prod.yml`
   - Deploy the stack

4. **Check service health**:
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   docker-compose -f docker-compose.prod.yml logs -f
   ```

5. **Access the application**:
   - Web UI: `http://your-server-ip:3131`
   - API: `http://your-server-ip:3001`
   - DNS: `your-server-ip:9053`

## Key Changes Made

### docker-compose.prod.yml
- Added `init-permissions` service to automatically handle file permissions
- Updated CORS configuration to allow all origins  
- Configured frontend to use relative URLs
- Added health checks for all services
- Configured proper service dependencies

### frontend/nginx.conf
- Added API proxy configuration to route `/api/` requests to backend
- Configured proper proxy headers and timeouts

### backend/src/server.js
- Updated CORS configuration to handle wildcard origins properly
- Improved error handling and logging

### New Files
- `PRODUCTION-FIXES.md`: This documentation file

### Removed Files
- `fix-permissions.sh`: No longer needed as permissions are handled by init container

## Troubleshooting

If you still encounter issues:

1. **Check container logs**:
   ```bash
   docker-compose -f docker-compose.prod.yml logs backend
   docker-compose -f docker-compose.prod.yml logs frontend
   docker-compose -f docker-compose.prod.yml logs bind9
   ```

2. **Verify file permissions**:
   ```bash
   ls -la backend/data/
   ls -la bind9/
   ```

3. **Test API connectivity**:
   ```bash
   curl http://your-server-ip:3001/health
   curl http://your-server-ip:3131/api/auth/setup-required
   ```

4. **Check Docker network**:
   ```bash
   docker network ls
   docker network inspect bind9webui_dns-network
   ```

The application should now work correctly in production with proper CORS handling, file permissions, and network communication.

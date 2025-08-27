# BIND9 WebUI - Quick Deployment Guide

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Container Registry](https://img.shields.io/badge/GitHub%20Container%20Registry-1f2328?style=for-the-badge&logo=github&logoColor=white)](https://ghcr.io)

Deploy BIND9 WebUI in minutes using pre-built Docker images. No building required!

## 🚀 One-Command Deployment

```bash
curl -sSL https://raw.githubusercontent.com/KuyaPollio/bind9WebUi/main/deploy.sh | bash
```

This script will:
- ✅ Download the latest configuration
- ✅ Set up directory structure
- ✅ Configure permissions
- ✅ Start the services
- ✅ Display access information

## 📋 Manual Deployment

### Step 1: Download Configuration

```bash
# Create project directory
mkdir bind9-webui && cd bind9-webui

# Download production docker-compose file
curl -sSL https://raw.githubusercontent.com/KuyaPollio/bind9WebUi/main/docker-compose.prod.yml -o docker-compose.yml

# Download environment template
curl -sSL https://raw.githubusercontent.com/KuyaPollio/bind9WebUi/main/env.example -o .env
```

### Step 2: Setup Directories

```bash
# Create necessary directories
mkdir -p bind9/{config,cache,records}
mkdir -p backend/data

# Set permissions
chmod 755 bind9/config bind9/records
chmod 777 bind9/cache backend/data
```

### Step 3: Download Basic Configuration

```bash
# Download BIND9 configuration files
curl -sSL https://raw.githubusercontent.com/KuyaPollio/bind9WebUi/main/bind9/config/named.conf -o bind9/config/named.conf
curl -sSL https://raw.githubusercontent.com/KuyaPollio/bind9WebUi/main/bind9/config/named.conf.local -o bind9/config/named.conf.local
curl -sSL https://raw.githubusercontent.com/KuyaPollio/bind9WebUi/main/bind9/config/named.conf.default-zones -o bind9/config/named.conf.default-zones
```

### Step 4: Configure (Optional)

Edit `.env` file to customize:

```env
# Port Configuration
WEBUI_PORT=3000          # Web interface port
API_PORT=3001            # Backend API port  
DNS_PORT=9053            # BIND9 DNS server port

# Security Configuration - CHANGE THIS IN PRODUCTION!
JWT_SECRET=your-super-secret-jwt-key-change-in-production-please

# Application Configuration
NODE_ENV=production
TZ=UTC

# Frontend API URL
REACT_APP_API_URL=http://localhost:3001
```

### Step 5: Start Services

```bash
docker-compose up -d
```

## 🌐 Access Your DNS Server

After deployment, access the web interface at:
- **Web UI**: `http://localhost:3000` (or your configured WEBUI_PORT)
- **API**: `http://localhost:3001` (or your configured API_PORT)
- **DNS Server**: `localhost:9053` (or your configured DNS_PORT)

## 📖 First-Time Setup

1. **Open the web interface** in your browser
2. **Create admin account** - you'll be prompted on first visit
3. **Start configuring** your DNS zones and records!

## 🐳 Docker Images

The deployment uses these pre-built images:

- **Backend**: `ghcr.io/kuyapollio/bind9webui-backend:latest`
- **Frontend**: `ghcr.io/kuyapollio/bind9webui-frontend:latest`
- **BIND9**: `ubuntu/bind9:latest` (official Ubuntu image)

### Available Tags

- `latest` - Latest stable release
- `main` - Latest development build
- `v1.0.0` - Specific version releases

## ⚙️ Configuration Examples

### Standard DNS Port (Production)

```env
DNS_PORT=53
WEBUI_PORT=80
JWT_SECRET=your-very-secure-random-secret-here
```

### Custom Ports (Behind Reverse Proxy)

```env
WEBUI_PORT=8080
API_PORT=8001
DNS_PORT=5353
REACT_APP_API_URL=http://your-domain.com:8001
```

### Development Environment

```env
NODE_ENV=development
WEBUI_PORT=3000
API_PORT=3001
DNS_PORT=9053
```

## 🔧 Management Commands

```bash
# View service status
docker-compose ps

# View logs
docker-compose logs

# View specific service logs
docker-compose logs dns-ui-backend
docker-compose logs dns-ui-frontend
docker-compose logs bind9

# Stop services
docker-compose down

# Update to latest images
docker-compose pull
docker-compose up -d

# Restart specific service
docker-compose restart dns-ui-backend
```

## 🔒 Security Considerations

### For Production Deployments:

1. **Change JWT Secret**:
   ```env
   JWT_SECRET=your-very-secure-random-secret-minimum-32-characters
   ```

2. **Use Standard DNS Port**:
   ```env
   DNS_PORT=53
   ```

3. **Restrict Access** (firewall rules):
   ```bash
   # Allow only specific IPs to web interface
   ufw allow from 192.168.1.0/24 to any port 3000
   ```

4. **Use HTTPS** (reverse proxy):
   - Nginx or Apache with SSL certificates
   - Cloudflare or similar CDN

5. **Regular Updates**:
   ```bash
   docker-compose pull && docker-compose up -d
   ```

## 📂 Directory Structure

After deployment, your directory structure will be:

```
bind9-webui/
├── docker-compose.yml          # Main compose file
├── .env                        # Configuration file
├── bind9/
│   ├── config/                # BIND9 configuration files
│   ├── cache/                 # BIND9 cache directory
│   └── records/               # DNS zone files
└── backend/
    └── data/                  # Application data (users, etc.)
```

## 🆘 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Check what's using the port
sudo lsof -i :3000
# Change port in .env file
WEBUI_PORT=8080
```

**DNS port 53 in use:**
```bash
# Stop system DNS resolver (Ubuntu/Debian)
sudo systemctl stop systemd-resolved
# Or use different port
DNS_PORT=5353
```

**Permission denied:**
```bash
# Fix permissions
sudo chown -R $USER:$USER bind9/
chmod 755 bind9/config bind9/records
chmod 777 bind9/cache backend/data
```

**Can't access web interface:**
```bash
# Check if services are running
docker-compose ps
# Check logs
docker-compose logs dns-ui-frontend
# Verify firewall settings
sudo ufw status
```

### Getting Help

- 📚 **Full Documentation**: [Main README](https://github.com/KuyaPollio/bind9WebUi)
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/KuyaPollio/bind9WebUi/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/KuyaPollio/bind9WebUi/discussions)

## 🔄 Updates

To update to the latest version:

```bash
# Pull latest images
docker-compose pull

# Restart with new images
docker-compose up -d

# Verify update
docker-compose ps
```

## 📋 System Requirements

- **Docker**: 20.10+ 
- **Docker Compose**: 2.0+
- **RAM**: 1GB minimum, 2GB recommended
- **Disk**: 1GB for application, additional space for DNS zones
- **Ports**: 3000 (Web), 3001 (API), 9053 (DNS) or custom ports

## 🌟 Features

- 🔐 Secure admin authentication
- 📝 BIND9 configuration editor
- 🌐 DNS zone and record management  
- 📊 Server logs monitoring
- 🌙 Dark/Light mode interface
- 📱 Mobile-responsive design
- 🔄 Auto-backup system
- 📖 Built-in help documentation

---

**Ready to manage your DNS server like a pro!** 🎉

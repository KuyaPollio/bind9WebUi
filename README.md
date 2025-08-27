# BIND9 WebUI - DNS Server Configuration Interface

[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Container Registry](https://img.shields.io/badge/GitHub%20Container%20Registry-1f2328?style=for-the-badge&logo=github&logoColor=white)](https://ghcr.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A professional, secure, and easy-to-use web interface for managing BIND9 DNS server configurations and records. Perfect for homelab environments with Docker deployment.

## 🚀 Quick Deployment (Recommended)

**One-command deployment using pre-built images:**

```bash
curl -sSL https://raw.githubusercontent.com/KuyaPollio/bind9WebUi/main/deploy.sh | bash
```

Or see the [Quick Deployment Guide](README.deployment.md) for step-by-step instructions.

## Features

- 🔐 **Secure Authentication** - Initial admin setup with secure login system
- 📝 **Configuration Editor** - Edit BIND9 configuration files with syntax validation
- 🌐 **DNS Record Management** - Manage DNS zones and records with visual table view
- 🎨 **Professional UI** - Clean, modern interface built with Material-UI
- 🐳 **Docker Ready** - Complete Docker Compose setup with BIND9 included
- 🔒 **Security First** - JWT authentication, input validation, and secure file handling
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## Deployment Options

### Option 1: Quick Deployment (Recommended)

Use pre-built Docker images for instant deployment:

```bash
curl -sSL https://raw.githubusercontent.com/KuyaPollio/bind9WebUi/main/deploy.sh | bash
```

See [Quick Deployment Guide](README.deployment.md) for details.

### Option 2: Development/Custom Build

For development or custom builds:

#### Prerequisites

- Docker and Docker Compose
- Ports for DNS (default: 9053), Web UI (default: 3000), and API (default: 3001)
- All ports are configurable via environment variables

#### Installation

1. **Clone this repository**
   ```bash
   git clone https://github.com/KuyaPollio/bind9WebUi.git
   cd bind9WebUi
   ```

2. **Configure the application (optional)**
   ```bash
   cp env.example .env
   # Edit .env to customize ports, JWT secret, and other settings
   ```

3. **Start the services**
   ```bash
   docker-compose up -d
   # OR use the convenience script:
   ./start.sh
   ```

4. **Access the web interface**
   - Open your browser and go to: `http://localhost:3000` (or your configured WEBUI_PORT)
   - Follow the initial setup to create your admin account
   - Start managing your DNS server!

### Initial Setup

On first access, you'll be prompted to create an admin account:

1. Choose a secure username (3+ characters, alphanumeric and underscores only)
2. Create a strong password (8+ characters with uppercase, lowercase, and numbers)
3. Confirm your password
4. Click "Create Admin Account"

You'll be automatically logged in and can start configuring your DNS server.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │     BIND9       │
│   (React.js)    │◄──►│   (Node.js)     │◄──►│   DNS Server    │
│   Port 3000     │    │   Port 3001     │    │   Port 53       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Services

- **bind9-dns**: Ubuntu BIND9 DNS server
- **dns-ui-backend**: Node.js API server for configuration management
- **dns-ui-frontend**: React.js web interface served by Nginx

### Data Persistence

- `./bind9/config/` - BIND9 configuration files
- `./bind9/records/` - DNS zone files
- `./backend/data/` - User accounts and application data

## Configuration Management

### Configuration Files

The web interface provides access to manage:

- `named.conf` - Main BIND9 configuration
- `named.conf.local` - Local zone definitions
- `named.conf.default-zones` - Default zones
- Custom configuration files

### Features

- **Syntax Validation** - Real-time validation of BIND9 configuration syntax
- **Backup System** - Automatic backups before any changes
- **File Management** - Create, edit, and delete configuration files
- **Monaco Editor** - Professional code editor with syntax highlighting

## DNS Record Management

### Zone Management

- Create new DNS zones with guided setup
- Edit existing zones with table or editor view
- Automatic SOA record generation
- Support for all common record types (A, AAAA, CNAME, MX, NS, PTR, SOA, SRV, TXT)

### Record View Modes

1. **Table View** - Visual table showing all records with filtering
2. **Editor View** - Direct zone file editing with syntax highlighting

## Security Features

- **JWT Authentication** - Secure token-based authentication
- **Input Validation** - Comprehensive server-side validation
- **Path Traversal Protection** - Prevents unauthorized file access
- **Rate Limiting** - Protects against brute force attacks
- **Secure Headers** - OWASP recommended security headers
- **File Backup** - Automatic backups before destructive operations

## API Documentation

### Authentication Endpoints

- `POST /api/auth/setup` - Initial admin setup
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token

### Configuration Endpoints

- `GET /api/config/files` - List configuration files
- `GET /api/config/files/:filename` - Get file content
- `PUT /api/config/files/:filename` - Update file content
- `POST /api/config/files` - Create new file
- `DELETE /api/config/files/:filename` - Delete file
- `POST /api/config/validate` - Validate configuration syntax

### Records Endpoints

- `GET /api/records/zones` - List zone files
- `GET /api/records/zones/:filename` - Get zone content
- `PUT /api/records/zones/:filename` - Update zone content
- `POST /api/records/zones` - Create new zone
- `DELETE /api/records/zones/:filename` - Delete zone

## Configuration

All configuration is now managed through a single `.env` file in the project root. Copy the example file and customize as needed:

```bash
cp env.example .env
```

### Available Configuration Options

```env
# Port Configuration
WEBUI_PORT=3000          # Web interface port
API_PORT=3001            # Backend API port  
DNS_PORT=9053            # BIND9 DNS server port

# Security Configuration - CHANGE THIS IN PRODUCTION!
JWT_SECRET=your-super-secret-jwt-key-change-in-production-please

# Application Configuration
NODE_ENV=production      # Environment mode
TZ=UTC                   # Timezone

# Frontend API URL (adjust if using different host/port)
REACT_APP_API_URL=http://localhost:3001
```

### Port Customization Examples

**Use standard DNS port 53:**
```env
DNS_PORT=53
```

**Run web interface on port 8080:**
```env
WEBUI_PORT=8080
REACT_APP_API_URL=http://localhost:3001  # Keep API URL consistent
```

**Custom ports for all services:**
```env
WEBUI_PORT=8080
API_PORT=8001
DNS_PORT=53
REACT_APP_API_URL=http://localhost:8001
```

### Security Notes

- **Always change `JWT_SECRET`** for production deployments
- Use a strong, random secret (32+ characters recommended)
- The default ports are chosen to avoid conflicts with system services

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm start
```

## Troubleshooting

### Common Issues

1. **Port 53 already in use**
   - The BIND9 server runs on port 9053 by default to avoid conflicts
   - To use port 53, stop system DNS resolver: `sudo systemctl stop systemd-resolved` (Linux)
   - On macOS, port 53 is typically used by the system, so port 9053 is recommended

2. **Permission issues with BIND9 files**
   - Ensure proper ownership: `sudo chown -R 104:109 bind9/`

3. **Cannot connect to API**
   - Check if backend container is running: `docker-compose logs dns-ui-backend`
   - Verify port 3001 is not blocked by firewall

4. **Configuration changes not taking effect**
   - Restart BIND9 service: `docker-compose restart bind9`
   - Check BIND9 logs: `docker-compose logs bind9`

### Logs

View service logs:
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs bind9
docker-compose logs dns-ui-backend
docker-compose logs dns-ui-frontend
```

## Security Considerations

This application is designed for homelab use. For production deployment:

1. **Change default JWT secret** in environment variables
2. **Use HTTPS** with proper SSL certificates  
3. **Implement firewall rules** to restrict access
4. **Regular backups** of configuration and zone files
5. **Monitor logs** for suspicious activity
6. **Keep containers updated** regularly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review Docker Compose logs
- Ensure all prerequisites are met
- Verify network connectivity between containers

---

**Note**: This is designed for homelab environments. Always follow security best practices for your specific use case.

## 🐳 Docker Images

Pre-built images are automatically published to GitHub Container Registry:

- **Backend**: `ghcr.io/kuyapollio/bind9webui-backend:latest`
- **Frontend**: `ghcr.io/kuyapollio/bind9webui-frontend:latest`

**Available tags:**
- `latest` - Latest stable release
- `main` - Latest development build  
- `v1.0.0` - Specific version releases

**Multi-architecture support:**
- `linux/amd64` (Intel/AMD)
- `linux/arm64` (Apple Silicon, ARM servers)

**Images are automatically built on:**
- Every push to main branch
- Every tagged release
- Pull requests (for testing)

**Security scanning:**
- All images are scanned with Trivy for vulnerabilities
- Security reports available in GitHub Security tab

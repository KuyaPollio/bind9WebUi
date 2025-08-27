#!/bin/bash

# BIND9 WebUI - Quick Deployment Script
# This script downloads and starts BIND9 WebUI using pre-built Docker images

set -e

echo "🚀 BIND9 WebUI Quick Deployment"
echo "==============================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose."
    exit 1
fi

# Create project directory
PROJECT_DIR="bind9-webui"
if [ ! -d "$PROJECT_DIR" ]; then
    echo "📁 Creating project directory: $PROJECT_DIR"
    mkdir -p "$PROJECT_DIR"
fi

cd "$PROJECT_DIR"

# Download production docker-compose file
echo "📥 Downloading docker-compose configuration..."
curl -sSL https://raw.githubusercontent.com/KuyaPollio/bind9WebUi/main/docker-compose.prod.yml -o docker-compose.yml

# Download environment template
echo "📥 Downloading environment template..."
curl -sSL https://raw.githubusercontent.com/KuyaPollio/bind9WebUi/main/env.example -o .env

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p bind9/{config,cache,records}
mkdir -p backend/data

# Set proper permissions
echo "🔐 Setting permissions..."
chmod 755 bind9/config bind9/records
chmod 777 bind9/cache backend/data

# Download basic BIND9 configuration files
echo "📥 Downloading basic BIND9 configuration..."
curl -sSL https://raw.githubusercontent.com/KuyaPollio/bind9WebUi/main/bind9/config/named.conf -o bind9/config/named.conf
curl -sSL https://raw.githubusercontent.com/KuyaPollio/bind9WebUi/main/bind9/config/named.conf.local -o bind9/config/named.conf.local
curl -sSL https://raw.githubusercontent.com/KuyaPollio/bind9WebUi/main/bind9/config/named.conf.default-zones -o bind9/config/named.conf.default-zones

echo ""
echo "⚠️  IMPORTANT: Please edit .env file and change the JWT_SECRET for production!"
echo "ℹ️  You can also customize ports and other settings in .env"
echo ""

# Ask if user wants to start now
read -p "🚀 Start BIND9 WebUI now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🐳 Starting BIND9 WebUI..."
    docker-compose up -d
    
    # Wait for services to start
    echo "⏳ Waiting for services to start..."
    sleep 10
    
    # Check service status
    echo ""
    echo "📊 Service Status:"
    docker-compose ps
    
    # Read actual ports from .env file or use defaults
    WEBUI_PORT=$(grep -E "^WEBUI_PORT=" .env 2>/dev/null | cut -d'=' -f2 || echo "3000")
    API_PORT=$(grep -E "^API_PORT=" .env 2>/dev/null | cut -d'=' -f2 || echo "3001")
    DNS_PORT=$(grep -E "^DNS_PORT=" .env 2>/dev/null | cut -d'=' -f2 || echo "9053")
    
    echo ""
    echo "✅ BIND9 WebUI is running!"
    echo ""
    echo "🌐 Access the web interface at: http://localhost:${WEBUI_PORT}"
    echo "🔧 API endpoint available at: http://localhost:${API_PORT}"
    echo "🌍 DNS server running on: localhost:${DNS_PORT}"
    echo ""
    echo "📖 First time setup:"
    echo "   1. Open http://localhost:${WEBUI_PORT} in your browser"
    echo "   2. Create your admin account"
    echo "   3. Start configuring your DNS server!"
    echo ""
    echo "⚙️  Configuration:"
    echo "   • Edit .env file to customize ports and settings"
    echo "   • Default JWT_SECRET should be changed for production"
else
    echo ""
    echo "📝 To start later, run:"
    echo "   cd $PROJECT_DIR && docker-compose up -d"
fi

echo ""
echo "📝 To view logs: docker-compose logs"
echo "🛑 To stop: docker-compose down"
echo ""
echo "📚 Full documentation: https://github.com/KuyaPollio/bind9WebUi"
echo ""

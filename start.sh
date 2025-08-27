#!/bin/bash

# BIND9 WebUI Startup Script
echo "🚀 Starting BIND9 WebUI..."
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

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p bind9/{config,cache,records}
mkdir -p backend/data

# Set proper permissions for BIND9
echo "🔐 Setting permissions..."
chmod 755 bind9/config bind9/records
chmod 777 bind9/cache backend/data

# Copy main environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📄 Creating main environment file..."
    cp env.example .env
    echo "⚠️  Please edit .env and change the JWT_SECRET for production!"
    echo "ℹ️  You can also customize ports and other settings in .env"
fi

# Start services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ BIND9 WebUI is starting up!"
echo ""

# Read actual ports from .env file or use defaults
WEBUI_PORT=$(grep -E "^WEBUI_PORT=" .env 2>/dev/null | cut -d'=' -f2 || echo "3000")
API_PORT=$(grep -E "^API_PORT=" .env 2>/dev/null | cut -d'=' -f2 || echo "3001")
DNS_PORT=$(grep -E "^DNS_PORT=" .env 2>/dev/null | cut -d'=' -f2 || echo "9053")

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
echo ""
echo "📝 To view logs: docker-compose logs"
echo "🛑 To stop: docker-compose down"
echo ""

# Contributing to BIND9 WebUI

Thank you for considering contributing to BIND9 WebUI! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Reporting Issues

1. **Search existing issues** first to avoid duplicates
2. **Use issue templates** when available
3. **Provide detailed information**:
   - Operating system and version
   - Docker version
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Features

1. **Check existing feature requests** in issues/discussions
2. **Explain the use case** and why it would be valuable
3. **Provide examples** of how it should work
4. **Consider implementation complexity**

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with clear messages**
6. **Push to your fork**
7. **Create a Pull Request**

## 🔧 Development Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Local Development

```bash
# Clone the repository
git clone https://github.com/KuyaPollio/bind9WebUi.git
cd bind9WebUi

# Set up environment
cp env.example .env

# Start development environment
docker-compose up -d

# For frontend development
cd frontend
npm install
npm start

# For backend development
cd backend
npm install
npm run dev
```

### Testing

```bash
# Run frontend tests
cd frontend
npm test

# Run backend tests
cd backend
npm test

# Test Docker build
docker-compose build
```

## 📝 Code Style Guidelines

### General

- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Handle errors appropriately

### Frontend (React)

- Use functional components with hooks
- Follow Material-UI patterns
- Implement responsive design
- Add proper TypeScript types when applicable

### Backend (Node.js)

- Use async/await for asynchronous operations
- Implement proper error handling
- Add input validation
- Follow REST API conventions

### Docker

- Use multi-stage builds when appropriate
- Minimize image size
- Follow security best practices
- Add health checks

## 🚀 Pull Request Process

### Before Submitting

1. **Test your changes** thoroughly
2. **Update documentation** if needed
3. **Add/update tests** for new features
4. **Ensure Docker builds work**
5. **Check for breaking changes**

### PR Requirements

1. **Clear title and description**
2. **Link related issues**
3. **Include screenshots** for UI changes
4. **List breaking changes** if any
5. **Ensure CI passes**

### Review Process

1. **Automated checks** must pass
2. **Code review** by maintainers
3. **Testing** in various environments
4. **Documentation review**
5. **Final approval and merge**

## 🏗️ Project Structure

```
bind9WebUi/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
├── backend/
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   └── server.js       # Main server file
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── services/       # API services
│   ├── Dockerfile
│   └── package.json
├── bind9/
│   ├── config/             # BIND9 configuration files
│   └── records/            # DNS zone files
├── docker-compose.yml      # Development compose
├── docker-compose.prod.yml # Production compose
├── deploy.sh              # Quick deployment script
└── README.md
```

## 🔒 Security Guidelines

### General Security

- Never commit secrets or credentials
- Use environment variables for configuration
- Validate all user inputs
- Follow OWASP security guidelines

### Backend Security

- Implement proper authentication
- Use parameterized queries
- Sanitize file paths
- Rate limit API endpoints

### Frontend Security

- Sanitize user inputs
- Use HTTPS in production
- Implement proper CORS
- Avoid XSS vulnerabilities

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document API endpoints
- Include examples in documentation
- Keep README files updated

### User Documentation

- Update help pages for new features
- Add configuration examples
- Include troubleshooting guides
- Provide migration guides for breaking changes

## 🎯 Release Process

### Version Numbers

We follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features (backward compatible)
- Patch: Bug fixes

### Release Steps

1. **Update version numbers**
2. **Update CHANGELOG.md**
3. **Create release tag**
4. **GitHub Actions builds and publishes Docker images**
5. **Create GitHub release with notes**

## 🤔 Questions?

- **General questions**: Use GitHub Discussions
- **Bug reports**: Create an issue
- **Feature requests**: Create an issue with feature request template
- **Security issues**: Email security@example.com (replace with actual email)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Special mentions for major features

Thank you for helping make BIND9 WebUI better! 🎉

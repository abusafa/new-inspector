# 🚀 Enterprise Safety Management System - Deployment Guide

## 📋 **System Overview**

This is a **complete enterprise-grade safety inspection management system** with:

- **Mobile-First Inspector App** - Offline-capable field inspection interface
- **Admin Dashboard** - Comprehensive management and analytics platform  
- **Backend API** - Scalable Node.js server with Prisma ORM
- **Advanced Features** - Role management, audit logging, notifications, recurring schedules

---

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Inspector     │    │     Admin       │    │     Backend     │
│   Mobile App    │    │   Dashboard     │    │      API        │
│                 │    │                 │    │                 │
│ • Offline-First │    │ • Role Mgmt     │    │ • Node.js       │
│ • Dynamic Forms │    │ • Analytics     │    │ • Prisma ORM    │
│ • Photo/Sig     │    │ • Audit Logs    │    │ • PostgreSQL    │
│ • Auto-Sync     │    │ • Notifications │    │ • REST APIs     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │    Database     │
                    │                 │
                    │ • PostgreSQL    │
                    │ • Redis Cache   │
                    │ • File Storage  │
                    └─────────────────┘
```

---

## 📦 **Prerequisites**

### Required Software
- **Node.js** v18+ 
- **npm** v9+
- **PostgreSQL** v14+
- **Redis** v6+ (for caching/sessions)

### Optional (Production)
- **Docker** & **Docker Compose**
- **Nginx** (reverse proxy)
- **SSL Certificate**
- **Cloud Storage** (AWS S3, Google Cloud, etc.)

---

## 🛠️ **Installation Steps**

### 1. Clone & Setup
```bash
git clone <your-repo-url>
cd new-inspector

# Install all dependencies
npm install
```

### 2. Database Setup
```bash
# Create PostgreSQL database
createdb safety_inspection_system

# Setup environment variables
cp .env.example .env
```

### 3. Environment Configuration

Create `.env` files in each app directory:

#### **Backend** (`apps/inspections-server/.env`)
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/safety_inspection_system"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secure-jwt-secret-key-here"
JWT_EXPIRES_IN="7d"

# Email (for notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@company.com"
SMTP_PASS="your-app-password"

# File Upload
MAX_FILE_SIZE="10MB"
UPLOAD_PATH="./uploads"

# API
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173,http://localhost:5174"
```

#### **Inspector App** (`apps/inspections-app/.env`)
```bash
VITE_API_BASE_URL="http://localhost:3001/api"
VITE_APP_NAME="Safety Inspector"
VITE_APP_VERSION="1.0.0"
```

#### **Admin Dashboard** (`apps/inspections-admin/.env`)
```bash
VITE_API_BASE_URL="http://localhost:3001/api"
VITE_APP_NAME="Safety Admin"
VITE_APP_VERSION="1.0.0"
```

### 4. Database Migration
```bash
cd apps/inspections-server

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed
```

### 5. Start Development Servers
```bash
# Terminal 1: Backend API
cd apps/inspections-server
npm run dev

# Terminal 2: Inspector Mobile App
cd apps/inspections-app
npm run dev

# Terminal 3: Admin Dashboard
cd apps/inspections-admin
npm run dev
```

### 6. Access Applications
- **Inspector App**: http://localhost:5173
- **Admin Dashboard**: http://localhost:5174
- **API Documentation**: http://localhost:3001/api/docs

---

## 🐳 **Docker Deployment**

### Development with Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Docker Setup
```bash
# Build production images
docker build -f apps/inspections-server/Dockerfile -t safety-api .
docker build -f apps/inspections-app/Dockerfile -t safety-inspector .
docker build -f apps/inspections-admin/Dockerfile -t safety-admin .

# Run with production compose
docker-compose -f docker-compose.prod.yml up -d
```

---

## ☁️ **Cloud Deployment Options**

### **AWS Deployment**
```bash
# Using AWS ECS/Fargate
aws ecs create-cluster --cluster-name safety-system

# Deploy with Terraform/CloudFormation
terraform init
terraform plan
terraform apply
```

### **Google Cloud Platform**
```bash
# Using Cloud Run
gcloud run deploy safety-api --source .
gcloud run deploy safety-inspector --source apps/inspections-app
gcloud run deploy safety-admin --source apps/inspections-admin
```

### **Azure Container Apps**
```bash
# Deploy to Azure
az containerapp up --name safety-system --resource-group rg-safety
```

### **Heroku (Simple Deploy)**
```bash
# Deploy backend
cd apps/inspections-server
heroku create safety-api-prod
git push heroku main

# Deploy frontend apps to Netlify/Vercel
npm run build
```

---

## 🔒 **Security Configuration**

### 1. SSL/TLS Setup
```nginx
# Nginx configuration
server {
    listen 443 ssl http2;
    server_name safety.yourcompany.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location / {
        proxy_pass http://localhost:5173;
    }
}
```

### 2. Environment Security
```bash
# Use strong passwords
openssl rand -base64 32  # For JWT_SECRET

# Restrict database access
# Configure PostgreSQL pg_hba.conf
host safety_inspection_system app_user 10.0.0.0/24 md5
```

### 3. API Security Headers
```typescript
// In main.ts
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"]
        }
    }
}));
```

---

## 📊 **Monitoring & Logging**

### 1. Application Monitoring
```typescript
// Add to main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
});
```

### 2. Database Monitoring
```bash
# PostgreSQL monitoring
SELECT * FROM pg_stat_activity;
SELECT * FROM pg_stat_database;
```

### 3. Log Aggregation
```yaml
# docker-compose.yml logging
version: '3.8'
services:
  api:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## 🔧 **Performance Optimization**

### 1. Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_workorders_assigned_to ON work_orders(assigned_to);
CREATE INDEX idx_inspections_status ON inspections(status);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
```

### 2. Redis Caching
```typescript
// Cache frequently accessed data
const cacheKey = `user:${userId}:permissions`;
const cached = await redis.get(cacheKey);
if (!cached) {
    const permissions = await getUserPermissions(userId);
    await redis.setex(cacheKey, 3600, JSON.stringify(permissions));
}
```

### 3. CDN Configuration
```javascript
// Serve static assets from CDN
const CDN_URL = process.env.CDN_URL || '';
app.use('/static', express.static('public', {
    setHeaders: (res) => {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
}));
```

---

## 📱 **Mobile App Configuration**

### 1. PWA Setup (Inspector App)
```javascript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/api\.yourcompany\.com\/.*$/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'api-cache',
                            expiration: {
                                maxEntries: 100,
                                maxAgeSeconds: 60 * 60 * 24 // 24 hours
                            }
                        }
                    }
                ]
            }
        })
    ]
});
```

### 2. Offline Storage Optimization
```typescript
// Increase storage quota
if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    console.log(`Storage quota: ${estimate.quota}`);
    console.log(`Storage usage: ${estimate.usage}`);
}
```

---

## 🧪 **Testing**

### 1. Run Test Suites
```bash
# Backend tests
cd apps/inspections-server
npm test

# Frontend tests
cd apps/inspections-app
npm test

cd apps/inspections-admin
npm test
```

### 2. End-to-End Testing
```bash
# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npx playwright test
```

### 3. Load Testing
```bash
# Install k6
npm install -g k6

# Run load test
k6 run loadtest.js
```

---

## 🚀 **Production Deployment Checklist**

### Pre-Deployment
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database migrations applied
- [ ] Backup strategy implemented
- [ ] Monitoring tools configured
- [ ] Load testing completed
- [ ] Security audit passed

### Deployment
- [ ] Build production assets
- [ ] Deploy database migrations
- [ ] Deploy backend API
- [ ] Deploy frontend applications
- [ ] Configure reverse proxy
- [ ] Test all endpoints
- [ ] Verify offline functionality

### Post-Deployment
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify notification delivery
- [ ] Test mobile app updates
- [ ] Document any issues
- [ ] Update team on deployment

---

## 📞 **Support & Maintenance**

### Common Issues

**Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

**Redis Connection Issues**
```bash
# Check Redis status
redis-cli ping
sudo systemctl restart redis
```

**File Upload Issues**
```bash
# Check disk space
df -h
# Check upload directory permissions
chmod 755 uploads/
```

### Backup Strategy
```bash
# Automated database backup
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump safety_inspection_system > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

### Update Procedure
```bash
# 1. Backup database
pg_dump safety_inspection_system > backup_pre_update.sql

# 2. Pull latest code
git pull origin main

# 3. Install dependencies
npm install

# 4. Run migrations
npx prisma migrate deploy

# 5. Build and restart
npm run build
pm2 restart all
```

---

## 🎯 **Success Metrics**

Monitor these KPIs post-deployment:

### Technical Metrics
- **API Response Time**: < 200ms average
- **Database Query Time**: < 100ms average
- **Uptime**: > 99.9%
- **Error Rate**: < 0.1%

### Business Metrics
- **Inspection Completion Rate**: Target 95%+
- **Mobile App Usage**: Daily active users
- **Offline Sync Success**: > 99%
- **User Satisfaction**: Regular surveys

### Compliance Metrics
- **Audit Log Completeness**: 100%
- **Data Retention**: Per regulatory requirements
- **Access Control**: Regular permission audits
- **Backup Success**: 100% automated backups

---

## 🆘 **Emergency Procedures**

### System Down
1. Check server status and logs
2. Verify database connectivity
3. Check external service dependencies
4. Implement emergency maintenance page
5. Notify stakeholders

### Data Recovery
1. Stop all services
2. Restore from latest backup
3. Verify data integrity
4. Test critical functions
5. Resume services

### Security Incident
1. Isolate affected systems
2. Change all passwords/keys
3. Review audit logs
4. Patch vulnerabilities
5. Document incident

---

This deployment guide ensures your enterprise safety management system is production-ready with proper security, monitoring, and maintenance procedures. The system is designed to scale from small teams to enterprise deployments with thousands of users.

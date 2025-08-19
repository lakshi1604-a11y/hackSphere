# Azure Cloud Deployment Guide for HackSphere

## Overview
This guide covers deploying HackSphere to Azure using multiple services:
- **Azure Web App** - Host the Node.js application
- **Azure Cosmos DB (MongoDB API)** - Flexible document database
- **Azure Storage** - Static files and assets
- **Azure Functions** - Serverless background tasks (optional)

## 1. Azure Cosmos DB Setup (MongoDB API)

### Create Cosmos DB Account
```bash
# Using Azure CLI
az cosmosdb create \
  --name hacksphere-cosmos \
  --resource-group hacksphere-rg \
  --kind MongoDB \
  --server-version 4.2 \
  --default-consistency-level Session \
  --locations regionName="East US" failoverPriority=0
```

### Get Connection String
```bash
az cosmosdb keys list \
  --name hacksphere-cosmos \
  --resource-group hacksphere-rg \
  --type connection-strings
```

### Connection String Format
```
mongodb://hacksphere-cosmos:PRIMARY_KEY@hacksphere-cosmos.mongo.cosmos.azure.com:10255/hacksphere?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@hacksphere-cosmos@
```

## 2. Azure Web App Deployment

### Create App Service Plan
```bash
az appservice plan create \
  --name hacksphere-plan \
  --resource-group hacksphere-rg \
  --sku B1 \
  --is-linux
```

### Create Web App
```bash
az webapp create \
  --resource-group hacksphere-rg \
  --plan hacksphere-plan \
  --name hacksphere-app \
  --runtime "NODE|20-lts" \
  --deployment-local-git
```

### Configure Environment Variables
```bash
az webapp config appsettings set \
  --resource-group hacksphere-rg \
  --name hacksphere-app \
  --settings \
    MONGODB_URL="your-cosmos-db-connection-string" \
    NODE_ENV="production" \
    SESSION_SECRET="your-session-secret"
```

## 3. Build Configuration

### Update package.json
```json
{
  "scripts": {
    "start": "NODE_ENV=production node dist/index.js",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "build:azure": "npm run build && cp package*.json dist/"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

### Create web.config (for Windows App Service)
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="dist/index.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^dist\/index.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="dist/index.js"/>
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    <httpErrors existingResponse="PassThrough" />
    <iisnode watchedFiles="web.config;*.js"/>
  </system.webServer>
</configuration>
```

## 4. Deployment Methods

### Method 1: Git Deployment
```bash
# Add Azure remote
git remote add azure https://hacksphere-app.scm.azurewebsites.net/hacksphere-app.git

# Deploy
git push azure main
```

### Method 2: ZIP Deployment
```bash
# Build the project
npm run build:azure

# Create deployment package
zip -r deploy.zip dist/ node_modules/ package*.json

# Deploy via Azure CLI
az webapp deployment source config-zip \
  --resource-group hacksphere-rg \
  --name hacksphere-app \
  --src deploy.zip
```

### Method 3: GitHub Actions
```yaml
name: Deploy to Azure Web App

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build application
      run: npm run build:azure
    
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'hacksphere-app'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: .
```

## 5. Environment Configuration

### Production Environment Variables
```bash
MONGODB_URL=mongodb://hacksphere-cosmos:KEY@hacksphere-cosmos.mongo.cosmos.azure.com:10255/hacksphere?ssl=true
NODE_ENV=production
PORT=8080
SESSION_SECRET=your-super-secure-session-secret
WEBSITE_NODE_DEFAULT_VERSION=20.0.0
```

### SSL Configuration
Azure Web Apps provide automatic SSL certificates. For custom domains:
```bash
az webapp config ssl bind \
  --resource-group hacksphere-rg \
  --name hacksphere-app \
  --certificate-thumbprint THUMBPRINT \
  --ssl-type SNI
```

## 6. Azure Storage (Optional)

### For file uploads and static assets
```bash
# Create storage account
az storage account create \
  --name hackspherestorage \
  --resource-group hacksphere-rg \
  --location eastus \
  --sku Standard_LRS

# Get connection string
az storage account show-connection-string \
  --name hackspherestorage \
  --resource-group hacksphere-rg
```

## 7. Monitoring and Logging

### Application Insights
```bash
az extension add -n application-insights

az monitor app-insights component create \
  --app hacksphere-insights \
  --location eastus \
  --resource-group hacksphere-rg
```

### Log Stream
```bash
az webapp log tail \
  --resource-group hacksphere-rg \
  --name hacksphere-app
```

## 8. Performance Optimization

### Azure CDN for Static Assets
```bash
az cdn profile create \
  --resource-group hacksphere-rg \
  --name hacksphere-cdn \
  --sku Standard_Microsoft

az cdn endpoint create \
  --resource-group hacksphere-rg \
  --profile-name hacksphere-cdn \
  --name hacksphere-endpoint \
  --origin hacksphere-app.azurewebsites.net
```

### Auto-scaling Configuration
```bash
az monitor autoscale create \
  --resource-group hacksphere-rg \
  --resource hacksphere-app \
  --resource-type Microsoft.Web/serverfarms \
  --name hacksphere-autoscale \
  --min-count 1 \
  --max-count 5 \
  --count 1
```

## 9. Cost Optimization

### Development Environment
- **App Service Plan**: B1 Basic ($13.14/month)
- **Cosmos DB**: Provisioned throughput 400 RU/s (~$23.36/month)
- **Total**: ~$36.50/month

### Production Environment
- **App Service Plan**: P1V2 Premium ($73/month)
- **Cosmos DB**: Autoscale 4000 RU/s (~$234/month)
- **Application Insights**: First 5GB free
- **Total**: ~$307/month

## 10. Security Best Practices

### Network Security
```bash
# Restrict access to Cosmos DB
az cosmosdb network-rule add \
  --resource-group hacksphere-rg \
  --name hacksphere-cosmos \
  --subnet /subscriptions/SUBSCRIPTION/resourceGroups/hacksphere-rg/providers/Microsoft.Network/virtualNetworks/vnet/subnets/web-subnet
```

### Key Vault Integration
```bash
az keyvault create \
  --name hacksphere-vault \
  --resource-group hacksphere-rg \
  --location eastus
```

This comprehensive setup provides a scalable, secure, and cost-effective deployment of HackSphere on Azure with MongoDB flexibility.
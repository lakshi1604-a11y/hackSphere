# Azure Deployment Steps for HackSphere

## Current Setup Ready for Deployment
✅ PostgreSQL Database: Neon Database (working)
✅ Application: Running on port 5000
✅ MongoDB Support: Available for future switching
✅ Build System: Vite + Express ready

## Step 1: Prepare Application for Azure

### Update package.json for Azure
```json
{
  "scripts": {
    "start": "NODE_ENV=production node dist/server/index.js",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/server --external:./vite.js",
    "build:azure": "npm run build && cp package*.json dist/"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

## Step 2: Azure CLI Setup

### Install Azure CLI (if not installed)
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### Login to Azure
```bash
az login
```

### Create Resource Group
```bash
az group create --name hacksphere-rg --location eastus
```

## Step 3: Create Azure Web App

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
  --name hacksphere-app-$(date +%s) \
  --runtime "NODE|20-lts" \
  --deployment-local-git
```

## Step 4: Configure Environment Variables

```bash
# Get your app name first
APP_NAME=$(az webapp list --resource-group hacksphere-rg --query "[0].name" -o tsv)

# Set environment variables
az webapp config appsettings set \
  --resource-group hacksphere-rg \
  --name $APP_NAME \
  --settings \
    DATABASE_URL="your-neon-database-url" \
    NODE_ENV="production" \
    SESSION_SECRET="$(openssl rand -base64 32)" \
    PORT="8080"
```

## Step 5: Deploy Application

### Method 1: Git Deployment (Recommended)
```bash
# Get Git URL
GIT_URL=$(az webapp deployment source config-local-git \
  --resource-group hacksphere-rg \
  --name $APP_NAME \
  --query url -o tsv)

# Add Azure remote
git remote add azure $GIT_URL

# Deploy
git add .
git commit -m "Deploy to Azure"
git push azure main
```

### Method 2: ZIP Deployment
```bash
# Build the application
npm run build:azure

# Create deployment package
zip -r deploy.zip dist/ node_modules/ package*.json

# Deploy via CLI
az webapp deployment source config-zip \
  --resource-group hacksphere-rg \
  --name $APP_NAME \
  --src deploy.zip
```

## Step 6: Verify Deployment

### Check Application Status
```bash
az webapp show \
  --resource-group hacksphere-rg \
  --name $APP_NAME \
  --query "state" -o tsv
```

### View Application URL
```bash
echo "https://$APP_NAME.azurewebsites.net"
```

### Check Logs
```bash
az webapp log tail \
  --resource-group hacksphere-rg \
  --name $APP_NAME
```

## Step 7: Custom Domain (Optional)

### Add Custom Domain
```bash
az webapp config hostname add \
  --resource-group hacksphere-rg \
  --webapp-name $APP_NAME \
  --hostname your-domain.com
```

### Enable SSL
```bash
az webapp config ssl bind \
  --resource-group hacksphere-rg \
  --name $APP_NAME \
  --certificate-thumbprint THUMBPRINT \
  --ssl-type SNI
```

## Cost Estimation

### Basic Deployment (B1 Plan)
- App Service: ~$13/month
- SSL Certificate: Free (Azure managed)
- Custom Domain: Free
- **Total: ~$13/month**

### Production Deployment (P1V2 Plan)
- App Service: ~$73/month
- Additional features: Auto-scaling, staging slots
- **Total: ~$73/month**

## Monitoring and Maintenance

### Application Insights
```bash
az monitor app-insights component create \
  --app hacksphere-insights \
  --location eastus \
  --resource-group hacksphere-rg
```

### Auto-scaling
```bash
az monitor autoscale create \
  --resource-group hacksphere-rg \
  --resource $APP_NAME \
  --resource-type Microsoft.Web/serverfarms \
  --name hacksphere-autoscale \
  --min-count 1 \
  --max-count 3 \
  --count 1
```

## Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version in package.json engines
2. **Database Connection**: Verify DATABASE_URL in app settings
3. **Port Issues**: Ensure PORT=8080 in environment variables
4. **Dependencies**: Run npm install before deployment

### Debug Commands
```bash
# Check app settings
az webapp config appsettings list --resource-group hacksphere-rg --name $APP_NAME

# Restart app
az webapp restart --resource-group hacksphere-rg --name $APP_NAME

# View configuration
az webapp config show --resource-group hacksphere-rg --name $APP_NAME
```

Your HackSphere application is ready for Azure deployment with the current PostgreSQL setup!
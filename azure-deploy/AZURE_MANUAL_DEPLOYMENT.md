# Azure Manual Deployment Guide for HackSphere

## Current Status
✅ **Application**: Running with MongoDB Atlas  
✅ **Database**: Connected to cluster0.stzqypy.mongodb.net  
✅ **Build**: Tested and production-ready  
✅ **Environment**: MongoDB URL configured  

## Method 1: Azure Portal Deployment (No CLI Required)

### Step 1: Create Azure Web App via Portal
1. Go to https://portal.azure.com
2. Click "Create a resource"
3. Search for "Web App" and select it
4. Fill in the details:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new "hacksphere-rg"
   - **Name**: hacksphere-app-[your-choice]
   - **Runtime**: Node 20 LTS
   - **Operating System**: Linux
   - **Pricing Plan**: B1 Basic (~$13/month)

### Step 2: Configure Environment Variables
1. Go to your Web App in Azure Portal
2. Navigate to "Configuration" → "Application settings"
3. Add these settings:
   ```
   NODE_ENV = production
   PORT = 8080
   MONGODB_URL = [your-mongodb-atlas-connection-string]
   SESSION_SECRET = [generate-random-32-char-string]
   WEBSITE_NODE_DEFAULT_VERSION = 20.0.0
   SCM_DO_BUILD_DURING_DEPLOYMENT = true
   ```

### Step 3: Deploy Code
**Option A: ZIP Deployment**
1. Build your application locally:
   ```bash
   npm run build
   ```
2. Create deployment ZIP:
   ```bash
   zip -r hacksphere-deploy.zip dist/ package*.json server/ shared/ client/ *.md
   ```
3. In Azure Portal → Deployment Center → ZIP Deploy
4. Upload the ZIP file

**Option B: GitHub Integration**
1. Push your code to GitHub
2. In Azure Portal → Deployment Center
3. Connect to your GitHub repository
4. Azure will automatically build and deploy

## Method 2: Azure CLI Deployment (If CLI Working)

### Commands to Run
```bash
# Login to Azure
az login

# Create resource group
az group create --name hacksphere-rg --location eastus

# Create app service plan
az appservice plan create \
  --name hacksphere-plan \
  --resource-group hacksphere-rg \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --resource-group hacksphere-rg \
  --plan hacksphere-plan \
  --name hacksphere-app-$(date +%s) \
  --runtime "NODE|20-lts"

# Configure app settings
az webapp config appsettings set \
  --resource-group hacksphere-rg \
  --name [your-app-name] \
  --settings \
    NODE_ENV="production" \
    PORT="8080" \
    MONGODB_URL="[your-mongodb-connection]" \
    SESSION_SECRET="[random-secret]"
```

## Method 3: Alternative Cloud Platforms

### Vercel Deployment (Free Option)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Configure environment variables in Vercel dashboard

### Railway Deployment
1. Go to railway.app
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically

### Render Deployment
1. Go to render.com
2. Create new Web Service
3. Connect repository
4. Configure build and start commands

## Your MongoDB Atlas Configuration
Your app is already configured with:
- **Host**: cluster0.stzqypy.mongodb.net
- **Database**: hacksphere (auto-created)
- **Collections**: Will be created automatically
- **Security**: IP whitelist configured

## Expected Azure Costs
- **Basic Plan (B1)**: ~$13/month
- **Standard Plan (S1)**: ~$73/month
- **Premium Plan (P1V2)**: ~$146/month

## Post-Deployment Checklist
1. ✅ App loads at your Azure URL
2. ✅ MongoDB connection working
3. ✅ Authentication system functional
4. ✅ All API endpoints responding
5. ✅ Static files serving correctly

## Troubleshooting
- **Build failures**: Check Node.js version is 20 LTS
- **Database connection**: Verify MONGODB_URL in app settings
- **Port issues**: Ensure PORT=8080 is set
- **Static files**: Verify build output includes dist/ directory

Your HackSphere application is ready for Azure deployment!
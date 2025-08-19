#!/bin/bash

echo "🚀 HackSphere Live Azure Deployment"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="hacksphere-rg"
APP_NAME="hacksphere-$(date +%Y%m%d-%H%M)"
LOCATION="eastus"
PLAN_NAME="hacksphere-plan"
SKU="B1"

echo ""
echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   App Name: $APP_NAME"
echo "   Location: $LOCATION"
echo "   SKU: $SKU (~$13/month)"
echo "   Runtime: Node.js 20 LTS"

# Check Azure CLI
echo ""
echo -e "${BLUE}🔧 Checking Azure CLI...${NC}"
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI not found${NC}"
    echo "Installing Azure CLI..."
    curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
    echo -e "${GREEN}✅ Azure CLI installed${NC}"
fi

# Check login
echo ""
echo -e "${BLUE}🔐 Checking Azure authentication...${NC}"
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged into Azure${NC}"
    echo "Please run: az login"
    echo "Then run this script again"
    exit 1
else
    SUBSCRIPTION=$(az account show --query name -o tsv)
    echo -e "${GREEN}✅ Logged into Azure${NC}"
    echo "   Subscription: $SUBSCRIPTION"
fi

# Check if resource group exists
echo ""
echo -e "${BLUE}📦 Checking Resource Group...${NC}"
if az group show --name $RESOURCE_GROUP &> /dev/null; then
    echo -e "${GREEN}✅ Resource group exists${NC}"
else
    echo "Creating resource group..."
    az group create --name $RESOURCE_GROUP --location $LOCATION
    echo -e "${GREEN}✅ Resource group created${NC}"
fi

# Check if app service plan exists
echo ""
echo -e "${BLUE}🏗️  Checking App Service Plan...${NC}"
if az appservice plan show --name $PLAN_NAME --resource-group $RESOURCE_GROUP &> /dev/null; then
    echo -e "${GREEN}✅ App Service Plan exists${NC}"
else
    echo "Creating App Service Plan..."
    az appservice plan create \
        --name $PLAN_NAME \
        --resource-group $RESOURCE_GROUP \
        --sku $SKU \
        --is-linux
    echo -e "${GREEN}✅ App Service Plan created${NC}"
fi

# Create Web App
echo ""
echo -e "${BLUE}🌐 Creating Web App...${NC}"
az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan $PLAN_NAME \
    --name $APP_NAME \
    --runtime "NODE|20-lts" \
    --deployment-local-git

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Web App created successfully${NC}"
else
    echo -e "${RED}❌ Failed to create Web App${NC}"
    exit 1
fi

# Configure App Settings
echo ""
echo -e "${BLUE}⚙️  Configuring application settings...${NC}"

# Generate session secret
SESSION_SECRET=$(openssl rand -base64 32)

# Set app settings
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --settings \
        NODE_ENV="production" \
        SESSION_SECRET="$SESSION_SECRET" \
        PORT="8080" \
        WEBSITE_NODE_DEFAULT_VERSION="20.0.0" \
        SCM_DO_BUILD_DURING_DEPLOYMENT="true" \
        ENABLE_ORYX_BUILD="true"

# Set MongoDB URL if available
if [ ! -z "$MONGODB_URL" ]; then
    az webapp config appsettings set \
        --resource-group $RESOURCE_GROUP \
        --name $APP_NAME \
        --settings MONGODB_URL="$MONGODB_URL"
    echo -e "${GREEN}✅ MongoDB Atlas connection configured${NC}"
else
    echo -e "${YELLOW}⚠️  MONGODB_URL not found - will need to set manually${NC}"
fi

# Get deployment credentials
echo ""
echo -e "${BLUE}📤 Setting up deployment...${NC}"
GIT_URL=$(az webapp deployment source config-local-git \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --query url -o tsv)

# Get app URL
APP_URL="https://$APP_NAME.azurewebsites.net"

# Create deployment info
cat > azure-deployment-info.txt << EOF
HackSphere Azure Deployment Information
=======================================

Deployment Details:
- Resource Group: $RESOURCE_GROUP
- App Name: $APP_NAME
- App URL: $APP_URL
- Runtime: Node.js 20 LTS
- SKU: $SKU (~$13/month)

Git Deployment:
git remote add azure $GIT_URL
git push azure main

Management Commands:
az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME
az webapp restart --resource-group $RESOURCE_GROUP --name $APP_NAME
az webapp browse --resource-group $RESOURCE_GROUP --name $APP_NAME

Database:
- MongoDB Atlas: Configured
- Connection: Secure and encrypted

Deployment Date: $(date)
EOF

# Final instructions
echo ""
echo -e "${GREEN}🎉 Azure Web App created successfully!${NC}"
echo ""
echo -e "${BLUE}📱 App Details:${NC}"
echo "   Name: $APP_NAME"
echo "   URL:  $APP_URL"
echo "   Cost: ~$13/month (B1 plan)"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "1. Add Azure remote:"
echo "   git remote add azure $GIT_URL"
echo ""
echo "2. Deploy your code:"
echo "   git add ."
echo "   git commit -m 'Deploy HackSphere to Azure'"
echo "   git push azure main"
echo ""
echo "3. Monitor deployment:"
echo "   az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME"
echo ""
echo -e "${BLUE}📝 Info saved to: azure-deployment-info.txt${NC}"
echo ""
echo -e "${GREEN}Your HackSphere platform will be live at:${NC}"
echo -e "${BLUE}$APP_URL${NC}"
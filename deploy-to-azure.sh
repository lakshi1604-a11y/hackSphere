#!/bin/bash

echo "🚀 HackSphere Azure Deployment Script"
echo "======================================"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Installing..."
    curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
fi

# Variables
RESOURCE_GROUP="hacksphere-rg"
APP_NAME="hacksphere-app-$(date +%s)"
LOCATION="eastus"
PLAN_NAME="hacksphere-plan"

echo ""
echo "📝 Deployment Configuration:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   App Name: $APP_NAME"
echo "   Location: $LOCATION"
echo "   Plan: $PLAN_NAME"

# Login check
echo ""
echo "🔐 Checking Azure login..."
if ! az account show &> /dev/null; then
    echo "Please login to Azure:"
    az login
fi

# Create resource group
echo ""
echo "📦 Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create app service plan
echo ""
echo "🏗️ Creating App Service Plan..."
az appservice plan create \
    --name $PLAN_NAME \
    --resource-group $RESOURCE_GROUP \
    --sku B1 \
    --is-linux

# Create web app
echo ""
echo "🌐 Creating Web App..."
az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan $PLAN_NAME \
    --name $APP_NAME \
    --runtime "NODE|20-lts" \
    --deployment-local-git

# Get current DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ DATABASE_URL not found in environment"
    echo "Please set it manually in Azure portal or run:"
    echo "export DATABASE_URL='your-database-url'"
    DB_URL_TO_SET="your-database-url-here"
else
    DB_URL_TO_SET="$DATABASE_URL"
fi

# Configure app settings
echo ""
echo "⚙️ Configuring application settings..."
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --settings \
        DATABASE_URL="$DB_URL_TO_SET" \
        NODE_ENV="production" \
        SESSION_SECRET="$(openssl rand -base64 32)" \
        PORT="8080" \
        WEBSITE_NODE_DEFAULT_VERSION="20.0.0"

# Get deployment URL
echo ""
echo "📤 Setting up Git deployment..."
GIT_URL=$(az webapp deployment source config-local-git \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --query url -o tsv)

# Build the application
echo ""
echo "🔨 Building application..."
npm run build

# Create deployment package
echo ""
echo "📦 Creating deployment package..."
mkdir -p deployment
cp -r dist/* deployment/ 2>/dev/null || echo "No dist directory, copying source..."
cp -r client deployment/ 2>/dev/null || true
cp -r server deployment/ 2>/dev/null || true
cp -r shared deployment/ 2>/dev/null || true
cp package*.json deployment/
cp *.md deployment/ 2>/dev/null || true

# Instructions
echo ""
echo "✅ Azure Web App created successfully!"
echo ""
echo "🔗 App URL: https://$APP_NAME.azurewebsites.net"
echo ""
echo "📤 To deploy your code:"
echo "1. Add Azure remote:"
echo "   git remote add azure $GIT_URL"
echo ""
echo "2. Deploy:"
echo "   git add ."
echo "   git commit -m 'Deploy to Azure'"
echo "   git push azure main"
echo ""
echo "📊 Check deployment status:"
echo "   az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME"
echo ""
echo "💰 Estimated cost: ~$13/month (B1 plan)"

# Save info to file
cat > azure-deployment-info.txt << EOF
Azure Deployment Information
============================

Resource Group: $RESOURCE_GROUP
App Name: $APP_NAME
App URL: https://$APP_NAME.azurewebsites.net
Git URL: $GIT_URL

Deployment Commands:
git remote add azure $GIT_URL
git push azure main

Management Commands:
az webapp log tail --resource-group $RESOURCE_GROUP --name $APP_NAME
az webapp restart --resource-group $RESOURCE_GROUP --name $APP_NAME
az webapp delete --resource-group $RESOURCE_GROUP --name $APP_NAME

Created: $(date)
EOF

echo ""
echo "📝 Deployment info saved to: azure-deployment-info.txt"
# Azure Database Integration for HackSphere

## Overview
This project now supports both Neon Database and Azure Database for PostgreSQL. The system automatically detects which database you're using based on your connection string.

## Azure Database Setup

### 1. Create Azure Database for PostgreSQL

1. Go to the Azure Portal
2. Create a new "Azure Database for PostgreSQL"
3. Choose "Single Server" or "Flexible Server" (recommended)
4. Configure your database settings

### 2. Configure Connection String

Your Azure Database connection string should look like:
```
postgresql://username%40servername:password@servername.postgres.database.azure.com:5432/databasename?sslmode=require
```

Key points:
- Username format: `username@servername` (URL encoded as `username%40servername`)
- Server format: `servername.postgres.database.azure.com`
- SSL is required for Azure Database

### 3. Set Environment Variable

In your Replit project, add the Azure connection string to your environment:
```
DATABASE_URL=postgresql://username%40servername:password@servername.postgres.database.azure.com:5432/databasename?sslmode=require
```

### 4. Configure Firewall Rules

In Azure Portal:
1. Go to your PostgreSQL server
2. Navigate to "Connection security"
3. Add your IP address or allow Azure services
4. For Replit, you may need to allow all IPs temporarily: 0.0.0.0 - 255.255.255.255

### 5. Push Database Schema

Run the following command to create all tables in your Azure database:
```bash
npm run db:push
```

## Features

### Automatic Detection
The system automatically detects if you're using Azure Database by checking if your connection string contains `postgres.database.azure.com`.

### SSL Configuration
Azure Database requires SSL connections. The configuration automatically handles this with proper SSL settings.

### Connection Pooling
Azure Database connections are configured with optimized pooling settings:
- Maximum connections: 20
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

## Troubleshooting

### Connection Issues
1. Verify your connection string format
2. Check firewall rules in Azure Portal
3. Ensure SSL is enabled
4. Confirm username includes `@servername`

### Performance
For better performance with Azure Database:
1. Use connection pooling (already configured)
2. Consider using Azure Database Flexible Server
3. Choose appropriate compute and storage tiers

## Security Best Practices

1. Use strong passwords
2. Restrict firewall rules to specific IP ranges
3. Enable audit logging in Azure
4. Regularly update database versions
5. Use Azure Key Vault for connection strings in production

## Switching Between Databases

To switch from Neon to Azure or vice versa:
1. Update the `DATABASE_URL` environment variable
2. Run `npm run db:push` to sync the schema
3. Restart the application

The system will automatically detect and configure the appropriate database driver.
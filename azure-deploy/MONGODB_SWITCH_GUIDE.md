# MongoDB Switching Guide for HackSphere

## Current Status
✅ **PostgreSQL**: Currently active and working  
✅ **MongoDB Support**: Fully implemented and ready  
✅ **Automatic Detection**: Smart switching based on connection string  

## How to Switch to MongoDB

### Option 1: MongoDB Atlas (Recommended - Free Tier Available)

1. **Create MongoDB Atlas Account**
   ```
   Visit: https://cloud.mongodb.com
   Sign up for free account
   ```

2. **Create Free Cluster**
   ```
   Choose: M0 Sandbox (Free)
   Region: Choose closest to your location
   Cluster Name: hacksphere-cluster
   ```

3. **Setup Database Access**
   ```
   Database Access → Add New Database User
   Username: hacksphere_user
   Password: Generate secure password
   Roles: Read and write to any database
   ```

4. **Setup Network Access**
   ```
   Network Access → Add IP Address
   Add: 0.0.0.0/0 (Allow access from anywhere)
   Or add specific IP addresses for security
   ```

5. **Get Connection String**
   ```
   Clusters → Connect → Connect your application
   Copy connection string like:
   mongodb+srv://hacksphere_user:<password>@hacksphere-cluster.xyz.mongodb.net/hacksphere?retryWrites=true&w=majority
   ```

6. **Switch Application**
   ```bash
   # Set environment variable
   export MONGODB_URL="your-atlas-connection-string"
   
   # Restart application
   # Application will automatically detect MongoDB and switch
   ```

### Option 2: Azure Cosmos DB (MongoDB API)

1. **Create Cosmos DB Account**
   ```bash
   az cosmosdb create \
     --name hacksphere-cosmos \
     --resource-group hacksphere-rg \
     --kind MongoDB \
     --server-version 4.2
   ```

2. **Get Connection String**
   ```bash
   az cosmosdb keys list \
     --name hacksphere-cosmos \
     --resource-group hacksphere-rg \
     --type connection-strings
   ```

3. **Connection String Format**
   ```
   mongodb://hacksphere-cosmos:PRIMARY_KEY@hacksphere-cosmos.mongo.cosmos.azure.com:10255/hacksphere?ssl=true&replicaSet=globaldb
   ```

4. **Switch Application**
   ```bash
   export MONGODB_URL="your-cosmos-connection-string"
   # Restart application
   ```

## What Happens When You Switch

### 1. Automatic Detection
The application checks environment variables in this order:
```javascript
// Check for MONGODB_URL first
process.env.MONGODB_URL

// Or check if DATABASE_URL is MongoDB format
process.env.DATABASE_URL.includes('mongodb://')
process.env.DATABASE_URL.includes('mongodb+srv://')
process.env.DATABASE_URL.includes('cosmos.azure.com')
```

### 2. Database Initialization
```
🍃 Initializing MongoDB connection...
✅ MongoDB storage initialized
```

### 3. Schema Creation
All MongoDB models are automatically available:
- Users with roles (participant, organizer, judge)
- Events with tracks, rules, prizes
- Teams with member management
- Submissions with AI scoring
- Timelines with status tracking
- Scores and announcements

### 4. Data Migration (Manual)
Since PostgreSQL and MongoDB have different data structures, you'll need to:
1. Export data from PostgreSQL if needed
2. Transform to MongoDB format
3. Import to new MongoDB database

## Benefits of MongoDB for HackSphere

### 1. Flexible Schema
- Easy to add new fields to events, users, teams
- No migrations needed for schema changes
- JSON-like document structure matches frontend needs

### 2. Scalability
- Built-in horizontal scaling
- Better performance for read-heavy workloads
- Automatic sharding with cloud providers

### 3. Real-time Features
- Change streams for live updates
- Better support for real-time notifications
- Optimized for frequent reads/writes

### 4. Cloud Integration
- Native support in Azure Cosmos DB
- Global distribution options
- Automatic scaling and backup

## Cost Comparison

### MongoDB Atlas
- **Free Tier**: M0 Sandbox (512MB storage)
- **Paid Plans**: Starting at $9/month (M2)
- **Features**: Automated backups, monitoring, security

### Azure Cosmos DB
- **Development**: ~$23/month (400 RU/s)
- **Production**: ~$234/month (4000 RU/s autoscale)
- **Features**: Global distribution, multi-model support

## Switching Back to PostgreSQL

To switch back to PostgreSQL:
```bash
# Remove MongoDB URL
unset MONGODB_URL

# Ensure DATABASE_URL is PostgreSQL
export DATABASE_URL="your-postgresql-connection-string"

# Restart application
```

The application will automatically detect PostgreSQL and switch back.

## Files Involved in MongoDB Support

- `shared/mongodb-schema.ts` - MongoDB/Mongoose schemas
- `server/mongodb.ts` - Connection management
- `server/mongodb-storage.ts` - Data access layer
- `server/unified-db.ts` - Smart database detection
- `server/index.ts` - Database initialization

Your HackSphere application is now ready for MongoDB. Choose your preferred cloud provider and start switching!
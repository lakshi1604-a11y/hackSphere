import mongoose from 'mongoose';

// MongoDB connection configuration
export const connectMongoDB = async () => {
  try {
    // Support both Azure Cosmos DB (MongoDB API) and regular MongoDB
    const mongoUrl = process.env.MONGODB_URL || process.env.DATABASE_URL;
    
    if (!mongoUrl) {
      throw new Error('MONGODB_URL or DATABASE_URL must be set for MongoDB connection');
    }

    // Connection options optimized for both Azure Cosmos DB and MongoDB Atlas
    const options = {
      
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      
      // Buffer settings
      bufferMaxEntries: 0,
      bufferCommands: false,
      
      // Azure Cosmos DB specific optimizations
      retryWrites: true,
      
      // SSL settings for Azure
      ssl: mongoUrl.includes('cosmos.azure.com') || mongoUrl.includes('mongodb.net'),
      sslValidate: true
    };

    // Connect to MongoDB
    const connection = await mongoose.connect(mongoUrl, options);
    
    console.log(`✅ MongoDB connected successfully to: ${connection.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

    return connection;
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
};

// Graceful shutdown
export const disconnectMongoDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('📤 MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
};

// Check if connected
export const isMongoConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Get connection info
export const getConnectionInfo = () => {
  return {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name
  };
};
import { connectMongoDB } from './mongodb';
import { MongoStorage } from './mongodb-storage';

// Determine database type from environment
const isMongoDatabase = process.env.MONGODB_URL || 
  (process.env.DATABASE_URL && (
    process.env.DATABASE_URL.includes('mongodb://') || 
    process.env.DATABASE_URL.includes('mongodb+srv://') ||
    process.env.DATABASE_URL.includes('cosmos.azure.com')
  ));

let storage: MongoStorage;

export const initializeDatabase = async () => {
  if (isMongoDatabase) {
    console.log('🍃 Initializing MongoDB connection...');
    await connectMongoDB();
    storage = new MongoStorage();
    console.log('✅ MongoDB storage initialized');
  } else {
    console.log('🐘 Using PostgreSQL (existing setup)');
    // Keep existing PostgreSQL setup from db.ts
    const { db } = await import('./db');
    console.log('✅ PostgreSQL storage ready');
  }
};

export const getStorage = () => {
  if (isMongoDatabase) {
    if (!storage) {
      throw new Error('MongoDB storage not initialized. Call initializeDatabase() first.');
    }
    return storage;
  } else {
    // Return PostgreSQL storage interface (existing)
    throw new Error('PostgreSQL storage interface not implemented yet');
  }
};

export const getDatabaseType = () => {
  return isMongoDatabase ? 'mongodb' : 'postgresql';
};
// Quick MongoDB connection test
import { MongoClient } from 'mongodb';

async function testConnection() {
  console.log('🧪 Testing MongoDB connection...');
  
  // Try different connection URLs
  const urls = [
    'mongodb://127.0.0.1:27017/hacksphere',
    'mongodb://localhost:27017/hacksphere'
  ];
  
  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const client = new MongoClient(url, {
        serverSelectionTimeoutMS: 3000,
        connectTimeoutMS: 3000
      });
      
      await client.connect();
      console.log('✅ MongoDB connection successful!');
      
      // Test database operations
      const db = client.db('hacksphere');
      const collections = await db.listCollections().toArray();
      console.log('📊 Available collections:', collections.length);
      
      await client.close();
      return url;
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
  
  console.log('❌ All MongoDB connection attempts failed');
  return null;
}

testConnection().catch(console.error);
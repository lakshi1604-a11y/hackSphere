import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleNode } from 'drizzle-orm/node-postgres';
import { Pool as NodePool } from 'pg';
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Determine if we're using Azure Database or Neon
const isAzureDatabase = process.env.DATABASE_URL.includes('postgres.database.azure.com');

let pool: NeonPool | NodePool;
let db: any;

if (isAzureDatabase) {
  // Azure Database for PostgreSQL configuration
  pool = new NodePool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Azure requires SSL
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  db = drizzleNode(pool, { schema });
} else {
  // Neon Database configuration (existing setup)
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon(pool as NeonPool, { schema });
}

export { pool, db };

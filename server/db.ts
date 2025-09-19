import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { Pool as PgPool } from "pg";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  const error = new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
  console.error("Database configuration error:", error.message);
  throw error;
}

// Check if we're in local development mode
const isLocalDev =
  process.env.NODE_ENV === "development" && !process.env.REPL_ID;

let pool: any;
let db: any;

if (isLocalDev) {
  // Check if it's a Supabase URL or local development
  const isSupabase = process.env.DATABASE_URL?.includes("supabase.co");

  if (isSupabase) {
    console.log("🔧 Using Supabase PostgreSQL connection");
    pool = new PgPool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  } else {
    console.log("🔧 Using local PostgreSQL connection");
    pool = new PgPool({ connectionString: process.env.DATABASE_URL });
  }
  db = drizzlePg({ client: pool, schema });
} else {
  // Use Neon serverless for production
  console.log("☁️ Using Neon serverless connection");
  try {
    neonConfig.webSocketConstructor = ws;
    pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
    db = drizzleNeon({ client: pool, schema });
    console.log("✅ Database connection initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize database connection:", error);
    throw error;
  }
}

export { pool, db };

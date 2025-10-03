import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import bcrypt from "bcrypt";

// Extend Express session type to include admin info
declare module "express-session" {
  interface SessionData {
    isAdmin: boolean;
    adminEmail?: string;
  }
}

// Session-based authentication middleware
export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.session && req.session.isAdmin) {
    return next();
  }

  return res
    .status(401)
    .json({ message: "Unauthorized - admin access required" });
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // For this simple system, admin and authenticated are the same
  return isAuthenticated(req, res, next);
}

export async function setupAuth(app: Express) {
  // Configure session middleware
  const sessionSecret = process.env.SESSION_SECRET || "wedding-rsvp-secret-change-in-production";
  const PostgresStore = connectPgSimple(session);

  // Create a separate pg Pool for session store (works in both dev and production)
  const sessionPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("supabase.co") || process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
  });

  const sessionConfig: session.SessionOptions = {
    store: new PostgresStore({
      pool: sessionPool,
      tableName: "session", // Default table name
      createTableIfMissing: true,
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax",
    },
  };

  app.use(session(sessionConfig));

  console.log("🔐 Session-based authentication system initialized");
  console.log("💾 Using PostgreSQL session store for persistence");
  console.log("✅ Only database admins are allowed to authenticate");
}

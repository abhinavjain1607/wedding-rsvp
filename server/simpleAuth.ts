import type { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
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

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: "lax",
      },
    })
  );

  console.log("🔐 Session-based authentication system initialized");
  console.log("✅ Only database admins are allowed to authenticate");
}

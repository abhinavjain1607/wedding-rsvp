import type { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";

// Simple admin authentication using environment variables
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // For now, we'll use a simple approach - check for admin header or bypass auth
  // In a real wedding RSVP site, you might want password-based admin login
  const adminPassword = req.headers['x-admin-password'] as string;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  
  if (!expectedPassword) {
    // If no admin password is set, allow access (for development)
    console.warn("⚠️  No ADMIN_PASSWORD environment variable set - allowing all admin access");
    return next();
  }
  
  if (adminPassword === expectedPassword) {
    return next();
  }
  
  return res.status(401).json({ message: "Unauthorized - admin access required" });
}

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  // For this simple system, admin and authenticated are the same
  return isAuthenticated(req, res, next);
}

export async function setupAuth(app: Express) {
  // Simple setup - no complex session management needed
  console.log("🔐 Simple authentication system initialized");
  
  // Basic admin login endpoint
  app.post("/api/login", async (req, res) => {
    const { password } = req.body;
    const expectedPassword = process.env.ADMIN_PASSWORD;
    
    if (!expectedPassword) {
      return res.json({ success: true, message: "Admin access granted (no password configured)" });
    }
    
    if (password === expectedPassword) {
      return res.json({ success: true, message: "Admin access granted" });
    }
    
    return res.status(401).json({ success: false, message: "Invalid password" });
  });
  
  // Logout endpoint (for consistency)
  app.post("/api/logout", (req, res) => {
    res.json({ success: true, message: "Logged out" });
  });
  
  // User info endpoint
  app.get("/api/user", (req, res) => {
    // For this simple system, return a basic admin user if authenticated
    const adminPassword = req.headers['x-admin-password'] as string;
    const expectedPassword = process.env.ADMIN_PASSWORD;
    
    if (!expectedPassword || adminPassword === expectedPassword) {
      return res.json({
        user: {
          sub: "admin",
          email: "admin@wedding.com", 
          first_name: "Admin",
          last_name: "User",
          profileImageUrl: null
        }
      });
    }
    
    return res.status(401).json({ message: "Not authenticated" });
  });
}
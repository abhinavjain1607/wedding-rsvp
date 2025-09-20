import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Check if we're in local development mode or Vercel (no Replit auth)
const isLocalDev =
  process.env.NODE_ENV === "development" && !process.env.REPL_ID;
const isVercel = process.env.VERCEL === "1";

if (!process.env.REPLIT_DOMAINS && !isLocalDev && !isVercel) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    if (isLocalDev) {
      // Return a dummy config for local development
      return null;
    }
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: !isLocalDev, // Only secure in production
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  // Map replit claims to admin fields
  const fullName = `${claims["first_name"] || ""} ${
    claims["last_name"] || ""
  }`.trim();

  try {
    await storage.createAdmin({
      email: claims["email"],
      name: fullName || claims["email"], // Use full name or fall back to email
      passwordHash: "", // No password needed for OAuth users
    });
  } catch (error) {
    // Admin might already exist, which is fine for upsert behavior
    console.log("Admin already exists or error creating:", error);
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  if (isLocalDev) {
    // Mock authentication for local development
    console.log(
      "🔧 Running in local development mode - using mock authentication"
    );

    // Mock passport strategies
    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));

    // Mock login route
    app.get("/api/login", (req, res) => {
      console.log("Mock login route hit");

      // Create a mock user session
      const mockUser = {
        claims: {
          sub: "mock-user-id",
          email: "admin@example.com",
          first_name: "Admin",
          last_name: "User",
          profile_image_url: "",
          exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        },
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };

      req.logIn(mockUser, (err) => {
        if (err) {
          console.error("Mock login error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        console.log("Mock login successful, redirecting to /");
        res.redirect("/");
      });
    });

    // Mock callback route
    app.get("/api/callback", (req, res) => {
      res.redirect("/");
    });

    // Mock logout route
    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect("/");
      });
    });

    return;
  }

  // Original Replit Auth setup for production
  const config = await getOidcConfig();

  if (!config) {
    throw new Error("Failed to get OIDC configuration");
  }

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config!, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

interface AuthenticatedUser {
  claims: any;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  try {
    if (isLocalDev) {
      // In local development, check both req.user and session
      console.log("isAuthenticated check - local dev mode");
      console.log("req.user:", req.user);
      console.log("req.session.user:", (req as any).session?.user);
      console.log("req.isAuthenticated():", req.isAuthenticated?.());

      const user = req.user || (req as any).session?.user;
      if (user) {
        console.log("User authenticated, proceeding");
        return next();
      }
      console.log("No user found, returning unauthorized");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Production authentication
    const user = req.user as AuthenticatedUser;

    if (!req.isAuthenticated() || !user?.expires_at) {
      console.log("Production auth failed: not authenticated or no expires_at");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = Math.floor(Date.now() / 1000);
    if (now <= user.expires_at) {
      return next();
    }

    const refreshToken = user.refresh_token;
    if (!refreshToken) {
      console.log("Production auth failed: no refresh token");
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      const config = await getOidcConfig();
      if (!config) {
        console.log("Production auth failed: no OIDC config");
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
      const tokenResponse = await client.refreshTokenGrant(
        config,
        refreshToken
      );
      updateUserSession(user, tokenResponse);
      return next();
    } catch (error) {
      console.log("Production auth failed: token refresh error:", error);
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
  } catch (error) {
    console.error("isAuthenticated middleware error:", error);
    res.status(500).json({ message: "Authentication system error" });
    return;
  }
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  try {
    if (isLocalDev) {
      // In local development, check both req.user and session
      console.log("isAdmin check - local dev mode");
      console.log("req.user:", req.user);
      console.log("req.session.user:", (req as any).session?.user);

      const user = req.user || (req as any).session?.user;
      if (user && user.email) {
        // Check against admins table
        const admin = await storage.getAdmin(user.email);
        if (admin) {
          console.log("User found in admins table, granting access");
          return next();
        }
      }

      console.log("User not found in admins table, denying access");
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required" });
    }

    const user = req.user as AuthenticatedUser;

    if (!user?.claims?.email) {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required" });
    }

    // Check if user is in admins table
    const admin = await storage.getAdmin(user.claims.email);
    if (!admin) {
      return res
        .status(403)
        .json({ message: "Forbidden: Admin access required" });
    }

    next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    return res.status(500).json({ message: "Error checking admin status" });
  }
};

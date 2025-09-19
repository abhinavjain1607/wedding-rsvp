import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./simpleAuth";
import {
  insertGuestSchema,
  insertGuestStep1Schema,
  insertGuestStep2Schema,
  findGuestSchema,
  insertDashboardContentSchema,
  insertGalleryImageSchema,
} from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";
import twilio from "twilio";

// Configure multer for file uploads
// Use /tmp directory in serverless environments (Vercel), local uploads in development
const uploadDir = process.env.VERCEL
  ? path.join("/tmp", "uploads")
  : path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!accountSid || !authToken || !twilioPhoneNumber) {
    throw new Error("Twilio credentials not configured");
  }

  try {
    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    // Send WhatsApp message
    const messageResponse = await client.messages.create({
      body: message,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:${phoneNumber}`,
    });

    console.log(
      `✅ WhatsApp message sent successfully: ${messageResponse.sid}`
    );
    return messageResponse;
  } catch (error) {
    console.error("❌ Error sending WhatsApp message:", error);
    throw error;
  }
}

function processMessageTemplate(template: string, guest: any): string {
  let processedMessage = template;

  // Replace guest information placeholders
  processedMessage = processedMessage.replace(
    /\{\{firstName\}\}/g,
    guest.firstName || ""
  );
  processedMessage = processedMessage.replace(
    /\{\{lastName\}\}/g,
    guest.lastName || ""
  );
  processedMessage = processedMessage.replace(
    /\{\{fullName\}\}/g,
    `${guest.firstName || ""} ${guest.lastName || ""}`.trim()
  );
  processedMessage = processedMessage.replace(
    /\{\{guestCount\}\}/g,
    guest.guestCount?.toString() || "1"
  );
  processedMessage = processedMessage.replace(
    /\{\{phoneWhatsapp\}\}/g,
    guest.phoneWhatsapp || ""
  );
  processedMessage = processedMessage.replace(
    /\{\{phoneSms\}\}/g,
    guest.phoneSms || ""
  );
  processedMessage = processedMessage.replace(
    /\{\{transportMode\}\}/g,
    guest.transportMode || "not specified"
  );
  processedMessage = processedMessage.replace(
    /\{\{rsvpStatus\}\}/g,
    guest.rsvpStatus || "pending"
  );

  // Replace accommodation status
  const accommodationText = guest.requiresAccommodation ? "Yes" : "No";
  processedMessage = processedMessage.replace(
    /\{\{requiresAccommodation\}\}/g,
    accommodationText
  );

  // Replace conditional accommodation text
  if (guest.requiresAccommodation) {
    processedMessage = processedMessage.replace(
      /\{\{ifAccommodation\}\}(.*?)\{\{\/ifAccommodation\}\}/g,
      "$1"
    );
  } else {
    processedMessage = processedMessage.replace(
      /\{\{ifAccommodation\}\}(.*?)\{\{\/ifAccommodation\}\}/g,
      ""
    );
  }

  // Replace conditional attending text
  if (guest.rsvpStatus === "attending") {
    processedMessage = processedMessage.replace(
      /\{\{ifAttending\}\}(.*?)\{\{\/ifAttending\}\}/g,
      "$1"
    );
  } else {
    processedMessage = processedMessage.replace(
      /\{\{ifAttending\}\}(.*?)\{\{\/ifAttending\}\}/g,
      ""
    );
  }

  return processedMessage;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Debug endpoint for local development
  app.get("/api/debug/user", (req: any, res) => {
    console.log("Debug user endpoint hit");
    const adminPassword = req.headers["x-admin-password"] as string;
    const expectedPassword = process.env.ADMIN_PASSWORD;
    const isAuth = !expectedPassword || adminPassword === expectedPassword;

    res.json({
      isAuthenticated: isAuth,
      hasAdminPassword: !!expectedPassword,
      adminPasswordProvided: !!adminPassword,
    });
  });

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      // Return a simple admin user since we have simple authentication
      res.json({
        user: {
          sub: "admin",
          email: "admin@wedding.com",
          first_name: "Admin",
          last_name: "User",
          profileImageUrl: null,
        },
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Local login endpoint (for frontend compatibility)
  app.post("/api/local-login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const expectedPassword = process.env.ADMIN_PASSWORD;

      if (!expectedPassword) {
        // If no admin password is set, allow access (for development)
        const userData = {
          id: "admin",
          email: email || "admin@wedding.com",
          firstName: "Admin",
          lastName: "User",
          profileImageUrl: "",
        };
        return res.json({
          message: "Login successful (no password configured)",
          user: userData,
          success: true,
        });
      }

      if (password === expectedPassword) {
        const userData = {
          id: "admin",
          email: email || "admin@wedding.com",
          firstName: "Admin",
          lastName: "User",
          profileImageUrl: "",
        };
        return res.json({
          message: "Login successful",
          user: userData,
          success: true,
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    } catch (error) {
      console.error("Local login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Public routes
  app.get("/api/dashboard-content", async (req, res) => {
    try {
      const content = await storage.getAllDashboardContent();
      res.json(content);
    } catch (error) {
      console.error("Error fetching dashboard content:", error);
      res.status(500).json({ message: "Failed to fetch dashboard content" });
    }
  });

  app.get("/api/dashboard-content/:section", async (req, res) => {
    try {
      const { section } = req.params;
      const content = await storage.getDashboardContent(section);
      res.json(content);
    } catch (error) {
      console.error("Error fetching dashboard content:", error);
      res.status(500).json({ message: "Failed to fetch dashboard content" });
    }
  });

  app.get("/api/gallery", async (req, res) => {
    try {
      const images = await storage.getAllGalleryImages();
      res.json(images);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      res.status(500).json({ message: "Failed to fetch gallery images" });
    }
  });

  // Guest RSVP routes - Step 1 (Basic Info)
  app.post("/api/guests/step1", async (req, res) => {
    try {
      console.log("Step 1 POST request received with body:", req.body);

      const guestData = insertGuestStep1Schema.parse(req.body);
      console.log("Parsed guest data:", guestData);

      // Check if email already exists
      const existingGuest = await storage.getGuestByEmail(guestData.email);
      if (existingGuest) {
        return res.status(400).json({
          message:
            "This email address is already registered. Please use the 'Update Existing RSVP' option to modify your details.",
        });
      }

      const guest = await storage.createGuest({
        ...guestData,
        step1Completed: true,
      });

      console.log("Created guest:", guest);

      res.status(201).json(guest);
    } catch (error) {
      console.error("Error creating guest step 1:", error);
      res.status(400).json({ message: "Failed to create guest RSVP step 1" });
    }
  });

  // Update guest step 1
  app.put("/api/guests/:id/step1", async (req, res) => {
    try {
      const { id } = req.params;
      const guestData = insertGuestStep1Schema.partial().parse(req.body);

      // Check if email is being updated and if it already exists for another guest
      if (guestData.email) {
        const existingGuest = await storage.getGuestByEmail(guestData.email);
        if (existingGuest && existingGuest.id !== id) {
          return res.status(400).json({
            message:
              "This email address is already registered with another RSVP. Please use a different email or update your existing RSVP.",
          });
        }
      }

      const guest = await storage.updateGuest(id, {
        ...guestData,
        step1Completed: true,
      });
      res.json(guest);
    } catch (error) {
      console.error("Error updating guest step 1:", error);
      res.status(400).json({ message: "Failed to update guest step 1" });
    }
  });

  // Guest RSVP routes - Step 2 (Detailed Info)
  app.put(
    "/api/guests/:id/step2",
    upload.single("idDocument"),
    async (req, res) => {
      try {
        const { id } = req.params;

        // Log the raw request body for debugging
        console.log("Raw req.body:", req.body);

        // Convert string boolean values from FormData to actual booleans
        const processedBody = { ...req.body };

        // Handle boolean fields that come as strings from FormData
        if (processedBody.needsTaxiDec10 !== undefined) {
          processedBody.needsTaxiDec10 =
            processedBody.needsTaxiDec10 === "true";
        }
        if (processedBody.needsTaxiDec11 !== undefined) {
          processedBody.needsTaxiDec11 =
            processedBody.needsTaxiDec11 === "true";
        }
        if (processedBody.needsTaxiReturn !== undefined) {
          processedBody.needsTaxiReturn =
            processedBody.needsTaxiReturn === "true";
        }

        // Handle empty strings as null for optional text fields
        [
          "flightNumber",
          "pickupDate",
          "pickupTime",
          "dropoffDate",
          "dropoffTime",
          "additionalNotes",
        ].forEach((field) => {
          if (processedBody[field] === "") {
            processedBody[field] = null;
          }
        });

        console.log("Processed body:", processedBody);

        const guestData = insertGuestStep2Schema.partial().parse(processedBody);

        // Handle file upload if present
        if (req.file) {
          const fileUrl = `/uploads/${req.file.filename}`;
          guestData.idUploadUrl = fileUrl;
        }

        const guest = await storage.updateGuest(id, {
          ...guestData,
          step2Completed: true,
        });
        res.json(guest);
      } catch (error) {
        console.error("Error updating guest step 2:", error);
        res.status(400).json({ message: "Failed to update guest step 2" });
      }
    }
  );

  // Find guest by first name and email (for updates)
  app.post("/api/guests/find-by-email", async (req, res) => {
    try {
      const { firstName, email } = findGuestSchema.parse(req.body);
      const guest = await storage.getGuestByFirstNameAndEmail(firstName, email);
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }
      res.json(guest);
    } catch (error) {
      console.error("Error finding guest by email:", error);
      res.status(400).json({ message: "Failed to find guest" });
    }
  });

  // Legacy routes (keeping for backward compatibility)
  app.post("/api/guests", upload.single("idDocument"), async (req, res) => {
    try {
      const guestData = insertGuestSchema.parse(req.body);

      // Check if email already exists
      if (guestData.email) {
        const existingGuest = await storage.getGuestByEmail(guestData.email);
        if (existingGuest) {
          return res.status(400).json({
            message:
              "This email address is already registered. Please use a different email address.",
          });
        }
      }

      // Handle file upload if present
      if (req.file) {
        const fileUrl = `/uploads/${req.file.filename}`;
        guestData.idUploadUrl = fileUrl;
      }

      const guest = await storage.createGuest(guestData);
      res.status(201).json(guest);
    } catch (error) {
      console.error("Error creating guest:", error);
      res.status(400).json({ message: "Failed to create guest RSVP" });
    }
  });

  app.post("/api/guests/find", async (req, res) => {
    try {
      const { firstName, lastName } = req.body;
      const guest = await storage.getGuestByName(firstName, lastName);
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }
      res.json(guest);
    } catch (error) {
      console.error("Error finding guest:", error);
      res.status(400).json({ message: "Failed to find guest" });
    }
  });

  app.put("/api/guests/:id", upload.single("idDocument"), async (req, res) => {
    try {
      const { id } = req.params;
      const guestData = insertGuestSchema.partial().parse(req.body);

      // Check if email is being updated and if it already exists for another guest
      if (guestData.email) {
        const existingGuest = await storage.getGuestByEmail(guestData.email);
        if (existingGuest && existingGuest.id !== id) {
          return res.status(400).json({
            message:
              "This email address is already registered with another RSVP. Please use a different email or update your existing RSVP.",
          });
        }
      }

      // Handle file upload if present
      if (req.file) {
        const fileUrl = `/uploads/${req.file.filename}`;
        guestData.idUploadUrl = fileUrl;
      }

      const guest = await storage.updateGuest(id, guestData);
      res.json(guest);
    } catch (error) {
      console.error("Error updating guest:", error);
      res.status(400).json({ message: "Failed to update guest" });
    }
  });

  // Photo upload route
  app.post(
    "/api/gallery/upload",
    upload.array("photos", 10),
    async (req, res) => {
      try {
        if (!req.files || !Array.isArray(req.files)) {
          return res.status(400).json({ message: "No files uploaded" });
        }

        const uploadedImages = [];
        for (const file of req.files) {
          const imageUrl = `/uploads/${file.filename}`;
          const image = await storage.createGalleryImage({
            imageUrl,
            caption: req.body.caption || "",
            uploadedBy: req.body.uploadedBy || "guest",
          });
          uploadedImages.push(image);
        }

        res.status(201).json(uploadedImages);
      } catch (error) {
        console.error("Error uploading photos:", error);
        res.status(400).json({ message: "Failed to upload photos" });
      }
    }
  );

  // Serve uploaded files
  app.use(
    "/uploads",
    (req, res, next) => {
      // Basic security check
      const filePath = path.join(uploadDir, req.path);
      if (!filePath.startsWith(uploadDir)) {
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    },
    express.static(uploadDir)
  );

  // Serve static images from client/public directory (for development)
  if (process.env.NODE_ENV === "development") {
    const publicImagesPath = path.join(process.cwd(), "client", "public");
    app.use("/images", express.static(path.join(publicImagesPath, "images")));
    console.log(
      `🖼️  Serving static images from: ${path.join(publicImagesPath, "images")}`
    );
  }

  // Admin routes
  app.get("/api/admin/guests", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const guests = await storage.getAllGuests();
      res.json(guests);
    } catch (error) {
      console.error("Error fetching guests:", error);
      res.status(500).json({ message: "Failed to fetch guests" });
    }
  });

  app.post("/api/admin/guests", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const guestData = insertGuestSchema.parse(req.body);
      const guest = await storage.createGuest(guestData);
      res.status(201).json(guest);
    } catch (error) {
      console.error("Error creating guest:", error);
      res.status(400).json({ message: "Failed to create guest" });
    }
  });

  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getGuestStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Admin management routes
  app.get("/api/admin/admins", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const adminList = await storage.getAllAdmins();
      res.json(adminList);
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ message: "Failed to fetch admins" });
    }
  });

  app.post("/api/admin/admins", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { email, name, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Check if admin already exists
      const existingAdmin = await storage.getAdmin(email);
      if (existingAdmin) {
        return res.status(400).json({ message: "Admin already exists" });
      }

      const admin = await storage.createAdminWithPassword(
        email,
        name || "Admin",
        password
      );
      res.status(201).json(admin);
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(400).json({ message: "Failed to create admin" });
    }
  });

  // Special route for initial admin setup (only works if no admins exist)
  app.post("/api/setup-admin", async (req, res) => {
    try {
      const allAdmins = await storage.getAllAdmins();
      if (allAdmins.length > 0) {
        return res.status(400).json({
          message: "Admins already exist. Use the admin interface to add more.",
        });
      }

      const { email, name, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const admin = await storage.createAdminWithPassword(
        email,
        name || "Admin",
        password
      );
      res
        .status(201)
        .json({ message: "Initial admin created successfully", admin });
    } catch (error) {
      console.error("Error setting up initial admin:", error);
      res.status(500).json({ message: "Failed to setup initial admin" });
    }
  });

  app.put(
    "/api/admin/dashboard-content",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const contentData = insertDashboardContentSchema.parse(req.body);
        const content = await storage.upsertDashboardContent(contentData);
        res.json(content);
      } catch (error) {
        console.error("Error updating dashboard content:", error);
        res.status(400).json({ message: "Failed to update dashboard content" });
      }
    }
  );

  app.post(
    "/api/admin/gallery",
    isAuthenticated,
    isAdmin,
    upload.array("images", 10),
    async (req, res) => {
      try {
        if (!req.files || !Array.isArray(req.files)) {
          return res.status(400).json({ message: "No files uploaded" });
        }

        const uploadedImages = [];
        for (const file of req.files) {
          const imageUrl = `/uploads/${file.filename}`;
          const image = await storage.createGalleryImage({
            imageUrl,
            caption: req.body.caption || "",
            uploadedBy: "admin",
          });
          uploadedImages.push(image);
        }

        res.status(201).json(uploadedImages);
      } catch (error) {
        console.error("Error uploading gallery images:", error);
        res.status(400).json({ message: "Failed to upload gallery images" });
      }
    }
  );

  app.delete(
    "/api/admin/gallery/:id",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { id } = req.params;
        await storage.deleteGalleryImage(id);
        res.status(204).send();
      } catch (error) {
        console.error("Error deleting gallery image:", error);
        res.status(400).json({ message: "Failed to delete gallery image" });
      }
    }
  );

  app.post(
    "/api/admin/message/send",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        console.log("📱 Message send request:", req.body);
        const { guestId, phoneNumber, message } = req.body;

        if (!phoneNumber || !message) {
          console.log("❌ Missing required fields");
          return res
            .status(400)
            .json({ message: "Phone number and message are required" });
        }

        console.log("📞 Sending WhatsApp message...");

        let processedMessage = message;
        // If there's a guestId, get guest data and process template
        if (guestId) {
          const guest = await storage.getGuest(guestId);
          if (guest) {
            processedMessage = processMessageTemplate(message, guest);
          }
        }

        // Send WhatsApp message
        const result = await sendWhatsAppMessage(phoneNumber, processedMessage);
        console.log("✅ WhatsApp message sent:", result);

        console.log("💾 Logging message to database...");
        // Log the message
        await storage.logMessage({
          guestId: guestId || null,
          phoneNumber,
          message: processedMessage, // Log the processed message
          status: result.status,
        });
        console.log("✅ Message logged to database");

        res.json({ success: true, result });
      } catch (error) {
        console.error("❌ Error sending message:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        res
          .status(500)
          .json({ message: "Failed to send message", error: errorMessage });
      }
    }
  );

  app.post(
    "/api/admin/message/bulk",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { guestIds, message } = req.body;

        if (!guestIds || !Array.isArray(guestIds) || !message) {
          return res
            .status(400)
            .json({ message: "Guest IDs and message are required" });
        }

        const results = [];
        for (const guestId of guestIds) {
          const guest = await storage.getGuest(guestId);
          if (guest && guest.phoneWhatsapp) {
            try {
              // Process message template with guest data
              const personalizedMessage = processMessageTemplate(
                message,
                guest
              );

              const result = await sendWhatsAppMessage(
                guest.phoneWhatsapp,
                personalizedMessage
              );
              await storage.logMessage({
                guestId,
                phoneNumber: guest.phoneWhatsapp,
                message: personalizedMessage, // Log the personalized message
                status: result.status,
              });
              results.push({ guestId, success: true });
            } catch (error) {
              console.error(
                `Failed to send message to guest ${guestId}:`,
                error
              );
              results.push({
                guestId,
                success: false,
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }
        }

        res.json({ success: true, results });
      } catch (error) {
        console.error("Error sending bulk messages:", error);
        res.status(500).json({ message: "Failed to send bulk messages" });
      }
    }
  );

  app.get(
    "/api/admin/message-logs",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const { guestId } = req.query;
        const logs = await storage.getMessageLogs(guestId as string);
        res.json(logs);
      } catch (error) {
        console.error("Error fetching message logs:", error);
        res.status(500).json({ message: "Failed to fetch message logs" });
      }
    }
  );

  app.get(
    "/api/admin/message-templates",
    isAuthenticated,
    isAdmin,
    async (req, res) => {
      try {
        const templates = await storage.getAllMessageTemplates();
        res.json(templates);
      } catch (error) {
        console.error("Error fetching message templates:", error);
        res.status(500).json({ message: "Failed to fetch message templates" });
      }
    }
  );

  app.get("/api/qr-code", (req, res) => {
    try {
      const baseUrl = process.env.REPLIT_DOMAINS
        ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
        : `${req.protocol}://${req.get("host")}`;

      const qrData = `${baseUrl}/photo-upload`;

      // In a real implementation, you would generate an actual QR code here
      // For now, return the URL that should be encoded
      res.json({
        qrCodeUrl: qrData,
        // You could also return a data URL for an actual QR code image
        message: "Scan to upload wedding photos",
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

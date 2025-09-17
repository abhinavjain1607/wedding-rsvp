import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
import { insertGuestSchema, insertDashboardContentSchema, insertGalleryImageSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
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

  // Note: In a real implementation, you would use Twilio SDK here
  // For now, we'll simulate the API call
  console.log(`Sending WhatsApp message to ${phoneNumber}: ${message}`);
  
  // Simulate API response
  return {
    sid: `SM${Date.now()}`,
    status: "sent",
    to: phoneNumber,
    body: message,
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Admin check middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userEmail = req.user.claims.email;
      const admin = await storage.getAdmin(userEmail);
      if (!admin) {
        return res.status(403).json({ message: "Access denied. Admin privileges required." });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Error checking admin status" });
    }
  };

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

  // Guest RSVP routes
  app.post("/api/guests", upload.single("idDocument"), async (req, res) => {
    try {
      const guestData = insertGuestSchema.parse(req.body);
      
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
  app.post("/api/gallery/upload", upload.array("photos", 10), async (req, res) => {
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
  });

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    // Basic security check
    const filePath = path.join(uploadDir, req.path);
    if (!filePath.startsWith(uploadDir)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  }, express.static(uploadDir));

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

  app.get("/api/admin/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const stats = await storage.getGuestStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.put("/api/admin/dashboard-content", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const contentData = insertDashboardContentSchema.parse(req.body);
      const content = await storage.upsertDashboardContent(contentData);
      res.json(content);
    } catch (error) {
      console.error("Error updating dashboard content:", error);
      res.status(400).json({ message: "Failed to update dashboard content" });
    }
  });

  app.post("/api/admin/gallery", isAuthenticated, isAdmin, upload.array("images", 10), async (req, res) => {
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
          uploadedBy: (req.user as any)?.claims?.email || "admin",
        });
        uploadedImages.push(image);
      }

      res.status(201).json(uploadedImages);
    } catch (error) {
      console.error("Error uploading gallery images:", error);
      res.status(400).json({ message: "Failed to upload gallery images" });
    }
  });

  app.delete("/api/admin/gallery/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteGalleryImage(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      res.status(400).json({ message: "Failed to delete gallery image" });
    }
  });

  app.post("/api/admin/message/send", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { guestId, phoneNumber, message } = req.body;

      if (!phoneNumber || !message) {
        return res.status(400).json({ message: "Phone number and message are required" });
      }

      // Send WhatsApp message
      const result = await sendWhatsAppMessage(phoneNumber, message);

      // Log the message
      await storage.logMessage({
        guestId: guestId || null,
        phoneNumber,
        message,
        status: result.status,
      });

      res.json({ success: true, result });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.post("/api/admin/message/bulk", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { guestIds, message } = req.body;

      if (!guestIds || !Array.isArray(guestIds) || !message) {
        return res.status(400).json({ message: "Guest IDs and message are required" });
      }

      const results = [];
      for (const guestId of guestIds) {
        const guest = await storage.getGuest(guestId);
        if (guest && guest.phoneWhatsapp) {
          try {
            const result = await sendWhatsAppMessage(guest.phoneWhatsapp, message);
            await storage.logMessage({
              guestId,
              phoneNumber: guest.phoneWhatsapp,
              message,
              status: result.status,
            });
            results.push({ guestId, success: true });
          } catch (error) {
            console.error(`Failed to send message to guest ${guestId}:`, error);
            results.push({ guestId, success: false, error: error instanceof Error ? error.message : String(error) });
          }
        }
      }

      res.json({ success: true, results });
    } catch (error) {
      console.error("Error sending bulk messages:", error);
      res.status(500).json({ message: "Failed to send bulk messages" });
    }
  });

  app.get("/api/admin/message-logs", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { guestId } = req.query;
      const logs = await storage.getMessageLogs(guestId as string);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching message logs:", error);
      res.status(500).json({ message: "Failed to fetch message logs" });
    }
  });

  app.get("/api/admin/message-templates", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const templates = await storage.getAllMessageTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching message templates:", error);
      res.status(500).json({ message: "Failed to fetch message templates" });
    }
  });

  app.get("/api/qr-code", (req, res) => {
    try {
      const baseUrl = process.env.REPLIT_DOMAINS ? 
        `https://${process.env.REPLIT_DOMAINS.split(',')[0]}` : 
        `${req.protocol}://${req.get('host')}`;
      
      const qrData = `${baseUrl}/photo-upload`;
      
      // In a real implementation, you would generate an actual QR code here
      // For now, return the URL that should be encoded
      res.json({ 
        qrCodeUrl: qrData,
        // You could also return a data URL for an actual QR code image
        message: "Scan to upload wedding photos" 
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

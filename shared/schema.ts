import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Admins table for email whitelist
export const admins = pgTable("admins", {
  email: varchar("email").primaryKey(),
  name: varchar("name"),
  passwordHash: varchar("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Guests table for RSVP management
export const guests = pgTable("guests", {
  id: uuid("id").defaultRandom().primaryKey(),
  // Step 1 fields
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  phoneWhatsapp: varchar("phone_whatsapp"),
  rsvpStatus: varchar("rsvp_status").default("pending"), // pending, attending, declined, tentative
  step1Completed: boolean("step1_completed").default(false),

  // Step 2 fields (optional, can be completed later)
  step2Completed: boolean("step2_completed").default(false),

  // ID Document upload (valid IDs: aadhar, pan, passport, voter id, drivers license)
  idDocumentType: varchar("id_document_type"), // aadhar, pan, passport, voter_id, drivers_license
  idUploadUrl: text("id_upload_url"),

  // Transport details
  transportMode: varchar("transport_mode"), // flight, train, driving, bus, other

  // Taxi service requirements
  needsTaxiDec10: boolean("needs_taxi_dec10").default(false),
  needsTaxiDec11: boolean("needs_taxi_dec11").default(false),
  needsTaxiReturn: boolean("needs_taxi_return").default(false),

  // Flight and timing details
  flightNumber: varchar("flight_number"),
  pickupDate: varchar("pickup_date"), // Dec 10 or Dec 11
  pickupTime: varchar("pickup_time"), // 6am to 12pm options
  dropoffDate: varchar("dropoff_date"), // till Dec 12
  dropoffTime: varchar("dropoff_time"), // till 12pm

  // Additional information
  additionalNotes: text("additional_notes"),

  // Legacy fields (keeping for backward compatibility)
  guestCount: integer("guest_count").default(1),
  requiresAccommodation: boolean("requires_accommodation").default(false),
  phoneSms: varchar("phone_sms"),
  pickupDateTime: timestamp("pickup_datetime"),
  dropoffDateTime: timestamp("dropoff_datetime"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Dashboard content table for CMS
export const dashboardContent = pgTable("dashboard_content", {
  id: integer("id").primaryKey(),
  sectionName: varchar("section_name").unique().notNull(),
  title: varchar("title"),
  content: text("content"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Gallery images table
export const galleryImages = pgTable("gallery_images", {
  id: uuid("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  uploadedBy: varchar("uploaded_by"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Message templates table
export const messageTemplates = pgTable("message_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name").notNull(),
  subject: varchar("subject"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Message logs table
export const messageLogs = pgTable("message_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  guestId: uuid("guest_id").references(() => guests.id),
  phoneNumber: varchar("phone_number").notNull(),
  message: text("message").notNull(),
  status: varchar("status").default("sent"),
  sentAt: timestamp("sent_at").defaultNow(),
});

// Relations
export const guestRelations = relations(guests, ({ many }) => ({
  messageLogs: many(messageLogs),
}));

export const messageLogRelations = relations(messageLogs, ({ one }) => ({
  guest: one(guests, {
    fields: [messageLogs.guestId],
    references: [guests.id],
  }),
}));

// Insert schemas
export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Step 1 specific schema
export const step1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  phoneWhatsapp: z.string().optional(),
  rsvpStatus: z.enum(["attending", "declined", "tentative"]),
});

export const insertGuestStep1Schema = createInsertSchema(guests).pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  phoneWhatsapp: true,
  rsvpStatus: true,
});

// Step 2 specific schema
export const insertGuestStep2Schema = createInsertSchema(guests).pick({
  idDocumentType: true,
  idUploadUrl: true,
  transportMode: true,
  needsTaxiDec10: true,
  needsTaxiDec11: true,
  needsTaxiReturn: true,
  flightNumber: true,
  pickupDate: true,
  pickupTime: true,
  dropoffDate: true,
  dropoffTime: true,
  additionalNotes: true,
});

// Update/find guest schema
export const findGuestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  email: z.string().email("Valid email is required"),
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  createdAt: true,
});

export const insertDashboardContentSchema = createInsertSchema(
  dashboardContent
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
  createdAt: true,
});

export const insertMessageTemplateSchema = createInsertSchema(
  messageTemplates
).omit({
  id: true,
  createdAt: true,
});

export const insertMessageLogSchema = createInsertSchema(messageLogs).omit({
  id: true,
  sentAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Guest = typeof guests.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type InsertGuestStep1 = z.infer<typeof insertGuestStep1Schema>;
export type InsertGuestStep2 = z.infer<typeof insertGuestStep2Schema>;
export type FindGuest = z.infer<typeof findGuestSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type DashboardContent = typeof dashboardContent.$inferSelect;
export type InsertDashboardContent = z.infer<
  typeof insertDashboardContentSchema
>;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertMessageTemplate = z.infer<typeof insertMessageTemplateSchema>;
export type MessageLog = typeof messageLogs.$inferSelect;
export type InsertMessageLog = z.infer<typeof insertMessageLogSchema>;

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
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
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
  createdAt: timestamp("created_at").defaultNow(),
});

// Guests table for RSVP management
export const guests = pgTable("guests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  phoneWhatsapp: varchar("phone_whatsapp"),
  phoneSms: varchar("phone_sms"),
  guestCount: integer("guest_count").notNull(),
  requiresAccommodation: boolean("requires_accommodation").default(false),
  transportMode: varchar("transport_mode"),
  idUploadUrl: text("id_upload_url"),
  rsvpStatus: varchar("rsvp_status").default("pending"),
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
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  imageUrl: text("image_url").notNull(),
  caption: text("caption"),
  uploadedBy: varchar("uploaded_by"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Message templates table
export const messageTemplates = pgTable("message_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  subject: varchar("subject"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Message logs table
export const messageLogs = pgTable("message_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
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

export const insertAdminSchema = createInsertSchema(admins).omit({
  createdAt: true,
});

export const insertDashboardContentSchema = createInsertSchema(dashboardContent).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGalleryImageSchema = createInsertSchema(galleryImages).omit({
  id: true,
  createdAt: true,
});

export const insertMessageTemplateSchema = createInsertSchema(messageTemplates).omit({
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
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type DashboardContent = typeof dashboardContent.$inferSelect;
export type InsertDashboardContent = z.infer<typeof insertDashboardContentSchema>;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = z.infer<typeof insertGalleryImageSchema>;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertMessageTemplate = z.infer<typeof insertMessageTemplateSchema>;
export type MessageLog = typeof messageLogs.$inferSelect;
export type InsertMessageLog = z.infer<typeof insertMessageLogSchema>;

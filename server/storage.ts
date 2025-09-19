import {
  guests,
  admins,
  dashboardContent,
  galleryImages,
  messageTemplates,
  messageLogs,
  type Guest,
  type InsertGuest,
  type Admin,
  type InsertAdmin,
  type DashboardContent,
  type InsertDashboardContent,
  type GalleryImage,
  type InsertGalleryImage,
  type MessageTemplate,
  type InsertMessageTemplate,
  type MessageLog,
  type InsertMessageLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, ilike, desc } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // Admin operations
  getAdmin(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  createAdminWithPassword(
    email: string,
    name: string,
    password: string
  ): Promise<Admin>;
  verifyAdminPassword(email: string, password: string): Promise<boolean>;
  updateAdminPassword(email: string, newPassword: string): Promise<void>;
  getAllAdmins(): Promise<Admin[]>;

  // Guest operations
  getGuest(id: string): Promise<Guest | undefined>;
  getGuestByName(
    firstName: string,
    lastName: string
  ): Promise<Guest | undefined>;
  getGuestByFirstNameAndEmail(
    firstName: string,
    email: string
  ): Promise<Guest | undefined>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  updateGuest(id: string, guest: Partial<InsertGuest>): Promise<Guest>;
  getAllGuests(): Promise<Guest[]>;
  getGuestStats(): Promise<{
    totalResponded: number;
    attending: number;
    declined: number;
    accommodationNeeded: number;
  }>;

  // Dashboard content operations
  getDashboardContent(
    sectionName: string
  ): Promise<DashboardContent | undefined>;
  upsertDashboardContent(
    content: InsertDashboardContent
  ): Promise<DashboardContent>;
  getAllDashboardContent(): Promise<DashboardContent[]>;

  // Gallery operations
  getAllGalleryImages(): Promise<GalleryImage[]>;
  createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage>;
  deleteGalleryImage(id: string): Promise<void>;
  updateGalleryImageOrder(id: string, sortOrder: number): Promise<void>;

  // Message operations
  getAllMessageTemplates(): Promise<MessageTemplate[]>;
  createMessageTemplate(
    template: InsertMessageTemplate
  ): Promise<MessageTemplate>;
  logMessage(log: InsertMessageLog): Promise<MessageLog>;
  getMessageLogs(guestId?: string): Promise<MessageLog[]>;
}

export class DatabaseStorage implements IStorage {
  // Admin operations
  async getAdmin(email: string): Promise<Admin | undefined> {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email));
    return admin;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [newAdmin] = await db.insert(admins).values(admin).returning();
    return newAdmin;
  }

  async createAdminWithPassword(
    email: string,
    name: string,
    password: string
  ): Promise<Admin> {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const [newAdmin] = await db
      .insert(admins)
      .values({
        email,
        name,
        passwordHash,
      })
      .returning();
    return newAdmin;
  }

  async verifyAdminPassword(email: string, password: string): Promise<boolean> {
    const admin = await this.getAdmin(email);
    if (!admin || !admin.passwordHash) {
      return false;
    }

    return await bcrypt.compare(password, admin.passwordHash);
  }

  async updateAdminPassword(email: string, newPassword: string): Promise<void> {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await db
      .update(admins)
      .set({ passwordHash })
      .where(eq(admins.email, email));
  }

  async getAllAdmins(): Promise<Admin[]> {
    return await db.select().from(admins);
  }

  // Guest operations
  async getGuest(id: string): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.id, id));
    return guest;
  }

  async getGuestByName(
    firstName: string,
    lastName: string
  ): Promise<Guest | undefined> {
    const [guest] = await db
      .select()
      .from(guests)
      .where(
        and(
          ilike(guests.firstName, firstName),
          ilike(guests.lastName, lastName)
        )
      );
    return guest;
  }

  async getGuestByFirstNameAndEmail(
    firstName: string,
    email: string
  ): Promise<Guest | undefined> {
    const [guest] = await db
      .select()
      .from(guests)
      .where(
        and(ilike(guests.firstName, firstName), ilike(guests.email, email))
      );
    return guest;
  }

  async createGuest(guest: InsertGuest): Promise<Guest> {
    const [newGuest] = await db.insert(guests).values(guest).returning();
    return newGuest;
  }

  async updateGuest(
    id: string,
    guestData: Partial<InsertGuest>
  ): Promise<Guest> {
    const [updatedGuest] = await db
      .update(guests)
      .set({ ...guestData, updatedAt: new Date() })
      .where(eq(guests.id, id))
      .returning();
    return updatedGuest;
  }

  async getAllGuests(): Promise<Guest[]> {
    return await db.select().from(guests).orderBy(desc(guests.createdAt));
  }

  async getGuestStats(): Promise<{
    totalResponded: number;
    attending: number;
    declined: number;
    accommodationNeeded: number;
  }> {
    const allGuests = await this.getAllGuests();

    const totalResponded = allGuests.filter(
      (g) => g.rsvpStatus !== "pending"
    ).length;
    const attending = allGuests.filter(
      (g) => g.rsvpStatus === "attending"
    ).length;
    const declined = allGuests.filter(
      (g) => g.rsvpStatus === "declined"
    ).length;
    const accommodationNeeded = allGuests.filter(
      (g) => g.requiresAccommodation
    ).length;

    return {
      totalResponded,
      attending,
      declined,
      accommodationNeeded,
    };
  }

  // Dashboard content operations
  async getDashboardContent(
    sectionName: string
  ): Promise<DashboardContent | undefined> {
    const [content] = await db
      .select()
      .from(dashboardContent)
      .where(eq(dashboardContent.sectionName, sectionName));
    return content;
  }

  async upsertDashboardContent(
    content: InsertDashboardContent
  ): Promise<DashboardContent> {
    const [upsertedContent] = await db
      .insert(dashboardContent)
      .values(content)
      .onConflictDoUpdate({
        target: dashboardContent.sectionName,
        set: {
          title: content.title,
          content: content.content,
          imageUrl: content.imageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return upsertedContent;
  }

  async getAllDashboardContent(): Promise<DashboardContent[]> {
    return await db.select().from(dashboardContent);
  }

  // Gallery operations
  async getAllGalleryImages(): Promise<GalleryImage[]> {
    return await db
      .select()
      .from(galleryImages)
      .orderBy(galleryImages.sortOrder);
  }

  async createGalleryImage(image: InsertGalleryImage): Promise<GalleryImage> {
    const [newImage] = await db.insert(galleryImages).values(image).returning();
    return newImage;
  }

  async deleteGalleryImage(id: string): Promise<void> {
    await db.delete(galleryImages).where(eq(galleryImages.id, id));
  }

  async updateGalleryImageOrder(id: string, sortOrder: number): Promise<void> {
    await db
      .update(galleryImages)
      .set({ sortOrder })
      .where(eq(galleryImages.id, id));
  }

  // Message operations
  async getAllMessageTemplates(): Promise<MessageTemplate[]> {
    return await db.select().from(messageTemplates);
  }

  async createMessageTemplate(
    template: InsertMessageTemplate
  ): Promise<MessageTemplate> {
    const [newTemplate] = await db
      .insert(messageTemplates)
      .values(template)
      .returning();
    return newTemplate;
  }

  async logMessage(log: InsertMessageLog): Promise<MessageLog> {
    const [newLog] = await db.insert(messageLogs).values(log).returning();
    return newLog;
  }

  async getMessageLogs(guestId?: string): Promise<MessageLog[]> {
    if (guestId) {
      return await db
        .select()
        .from(messageLogs)
        .where(eq(messageLogs.guestId, guestId))
        .orderBy(desc(messageLogs.sentAt));
    }
    return await db
      .select()
      .from(messageLogs)
      .orderBy(desc(messageLogs.sentAt));
  }
}

export const storage = new DatabaseStorage();

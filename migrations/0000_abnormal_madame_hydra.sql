CREATE TABLE "admins" (
	"email" varchar PRIMARY KEY NOT NULL,
	"name" varchar,
	"password_hash" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dashboard_content" (
	"id" integer PRIMARY KEY NOT NULL,
	"section_name" varchar NOT NULL,
	"title" varchar,
	"content" text,
	"image_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "dashboard_content_section_name_unique" UNIQUE("section_name")
);
--> statement-breakpoint
CREATE TABLE "gallery_images" (
	"id" uuid PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"caption" text,
	"uploaded_by" varchar,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar NOT NULL,
	"last_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"phone_whatsapp" varchar,
	"rsvp_status" varchar DEFAULT 'pending',
	"step1_completed" boolean DEFAULT false,
	"step2_completed" boolean DEFAULT false,
	"id_document_type" varchar,
	"id_upload_url" text,
	"transport_mode" varchar,
	"needs_taxi_dec10" boolean DEFAULT false,
	"needs_taxi_dec11" boolean DEFAULT false,
	"needs_taxi_return" boolean DEFAULT false,
	"flight_number" varchar,
	"pickup_date" varchar,
	"pickup_time" varchar,
	"dropoff_date" varchar,
	"dropoff_time" varchar,
	"additional_notes" text,
	"guest_count" integer DEFAULT 1,
	"requires_accommodation" boolean DEFAULT false,
	"phone_sms" varchar,
	"pickup_datetime" timestamp,
	"dropoff_datetime" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "message_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_id" uuid,
	"phone_number" varchar NOT NULL,
	"message" text NOT NULL,
	"status" varchar DEFAULT 'sent',
	"sent_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "message_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"subject" varchar,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "message_logs" ADD CONSTRAINT "message_logs_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");
ALTER TABLE "guests" ALTER COLUMN "id_upload_urls" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "adult_count" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "kid_count" integer DEFAULT 0;
DROP TABLE "sessions" CASCADE;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "needs_transport_dec9" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "needs_transport_dec10" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "needs_transport_dec11" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "needs_transport_return" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "guests" DROP COLUMN "needs_taxi_dec10";--> statement-breakpoint
ALTER TABLE "guests" DROP COLUMN "needs_taxi_dec11";--> statement-breakpoint
ALTER TABLE "guests" DROP COLUMN "needs_taxi_return";
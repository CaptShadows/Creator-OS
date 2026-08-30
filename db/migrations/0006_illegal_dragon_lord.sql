ALTER TABLE "contents" ALTER COLUMN "priority" SET DEFAULT 1;--> statement-breakpoint
UPDATE "contents" SET "priority" = 1 WHERE "priority" = 0;

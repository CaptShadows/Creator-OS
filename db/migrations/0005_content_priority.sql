UPDATE "contents" SET "priority" = 2 WHERE "priority" = 0;
--> statement-breakpoint
ALTER TABLE "contents" ALTER COLUMN "priority" SET DEFAULT 2;

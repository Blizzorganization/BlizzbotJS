ALTER TABLE "mcnames" RENAME COLUMN "whitelistYouTube" TO "whitelistYoutube";--> statement-breakpoint
ALTER TABLE "Aliases" ALTER COLUMN "command" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Aliases" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "CustomCommands" ALTER COLUMN "commandName" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "CustomCommands" ALTER COLUMN "response" SET NOT NULL;--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'mcnames'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "mcnames" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "mcnames" ALTER COLUMN "whitelistTwitch" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "mcnames" ALTER COLUMN "whitelistYoutube" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ranking" ALTER COLUMN "discordId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ranking" ALTER COLUMN "guildId" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ranking" ALTER COLUMN "experience" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "ranking" ALTER COLUMN "experience" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ranking" ALTER COLUMN "available" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "ranking" ALTER COLUMN "available" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ranking" ALTER COLUMN "username" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "mcnames" ADD COLUMN "id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "CustomCommands" ADD CONSTRAINT "CustomCommands_commandName_unique" UNIQUE ("commandName");
DO $$ BEGIN
 ALTER TABLE "Aliases" ADD CONSTRAINT "Aliases_command_CustomCommands_commandName_fk" FOREIGN KEY ("command") REFERENCES "public"."CustomCommands"("commandName") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "Aliases" DROP COLUMN IF EXISTS "type";--> statement-breakpoint
ALTER TABLE "Aliases" DROP COLUMN IF EXISTS "createdAt";--> statement-breakpoint
ALTER TABLE "Aliases" DROP COLUMN IF EXISTS "updatedAt";--> statement-breakpoint
ALTER TABLE "CustomCommands" DROP COLUMN IF EXISTS "createdAt";--> statement-breakpoint
ALTER TABLE "CustomCommands" DROP COLUMN IF EXISTS "updatedAt";--> statement-breakpoint
ALTER TABLE "mcnames" DROP COLUMN IF EXISTS "createdAt";--> statement-breakpoint
ALTER TABLE "mcnames" DROP COLUMN IF EXISTS "updatedAt";--> statement-breakpoint
ALTER TABLE "ranking" DROP COLUMN IF EXISTS "createdAt";--> statement-breakpoint
ALTER TABLE "ranking" DROP COLUMN IF EXISTS "updatedAt";
-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations

CREATE TABLE IF NOT EXISTS "Aliases" (
	"id" serial PRIMARY KEY NOT NULL,
	"command" text,
	"name" text,
	"type" text,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "CustomCommands" (
	"id" serial PRIMARY KEY NOT NULL,
	"commandName" text,
	"response" text,
	"lastEditedBy" bigint,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "mcnames" (
	"discordId" bigint PRIMARY KEY NOT NULL,
	"mcName" varchar(255),
	"mcId" uuid,
	"whitelistTwitch" boolean DEFAULT false,
	"whitelistYouTube" boolean DEFAULT false,
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ranking" (
	"id" serial PRIMARY KEY NOT NULL,
	"discordId" bigint,
	"guildId" bigint,
	"experience" integer,
	"available" boolean,
	"username" varchar(255),
	"createdAt" timestamp with time zone NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import config from "./config";
import { migrate } from "drizzle-orm/postgres-js/migrator";

export const sql = postgres(config.database);
export const db = drizzle(sql, { logger: true });
await migrate(db, { migrationsFolder: "drizzle" });

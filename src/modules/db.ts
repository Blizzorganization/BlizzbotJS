import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import config from "./config";

export const sql = postgres(config.database);
export const db = drizzle(sql, { logger: true });
await migrate(db, { migrationsFolder: "drizzle" });

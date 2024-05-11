import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import config from "./config";

export const sql = postgres(config.database);
export const db = drizzle(sql);

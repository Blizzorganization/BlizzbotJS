import { defineConfig } from "drizzle-kit";
import config from "./configs/config.json";

export default defineConfig({
  dbCredentials: {
    database: config.database.database,
    host: config.database.host,
    password: config.database.password,
    port: config.database.port,
    user: config.database.user,
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./src/db/*",
});

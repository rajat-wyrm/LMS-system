import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Force load .env file from the backend directory
dotenv.config({ path: "./.env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
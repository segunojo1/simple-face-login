import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to your .env.local");
}

export const sql = neon(connectionString);

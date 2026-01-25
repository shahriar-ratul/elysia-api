import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/client";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const adapter = new PrismaPg(pool);
const logQueries = process.env.DB_LOG_QUERIES === "true";

export const db = new PrismaClient({
  adapter,
  log: logQueries ? ["query", "info", "warn", "error"] : ["warn", "error"],
});

async function shutdown() {
  await db.$disconnect();
  await pool.end();
}

process.on("beforeExit", () => {
  void shutdown();
});

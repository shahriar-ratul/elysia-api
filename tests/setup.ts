import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { config } from "dotenv";
import path from "path";

// Load environment variables from .env.test file
config({ path: path.resolve(__dirname, "../.env.test") });

// Ensure test environment is set
process.env.NODE_ENV = "test";

// Global test hooks
beforeAll(async () => {
  // Setup test database connection
  console.log("🧪 Starting test suite...");
});

afterAll(async () => {
  // Cleanup and disconnect
  console.log("✅ Test suite completed");
});

beforeEach(async () => {
  // Clear test data before each test
});

afterEach(async () => {
  // Cleanup after each test
});

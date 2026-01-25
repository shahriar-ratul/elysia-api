/**
 * Utility to read secrets from Docker Swarm secrets or environment variables
 *
 * Docker Swarm secrets are mounted at /run/secrets/<secret_name>
 * This utility provides a fallback to environment variables for local development
 */

import { readFileSync, existsSync } from "fs";

/**
 * Read a secret from Docker Swarm secret file or environment variable
 *
 * @param secretName - Name of the secret (file name in /run/secrets/)
 * @param envVar - Environment variable name as fallback
 * @param defaultValue - Default value if neither secret nor env var exists
 * @returns Secret value
 */
export function readSecret(
  secretName: string,
  envVar?: string,
  defaultValue?: string
): string {
  const secretPath = `/run/secrets/${secretName}`;

  // Try to read from Docker Swarm secret file
  if (existsSync(secretPath)) {
    try {
      return readFileSync(secretPath, "utf8").trim();
    } catch (error) {
      console.warn(`Failed to read secret from ${secretPath}:`, error);
    }
  }

  // Fallback to environment variable
  if (envVar && process.env[envVar]) {
    return process.env[envVar];
  }

  // Use default value if provided
  if (defaultValue !== undefined) {
    return defaultValue;
  }

  throw new Error(
    `Secret ${secretName} not found in /run/secrets/${secretName} or environment variable ${envVar}`
  );
}

/**
 * Read database URL from secret or environment variable
 */
export function getDatabaseUrl(): string {
  return readSecret("database_url", "DATABASE_URL");
}

/**
 * Read JWT secret from secret or environment variable
 */
export function getJwtSecret(): string {
  return readSecret("jwt_secret", "JWT_SECRET");
}

/**
 * Read PostgreSQL password from secret or environment variable
 */
export function getPostgresPassword(): string {
  return readSecret("postgres_password", "POSTGRES_PASSWORD");
}

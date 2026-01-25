#!/usr/bin/env node

/**
 * Performance Testing Script
 *
 * Tests API endpoints under load to measure:
 * - Requests per second
 * - Latency (avg, p50, p95, p99)
 * - Throughput
 */

import autocannon from "autocannon";

const PORT = process.env.PORT || 4000;
const BASE_URL = `http://localhost:${PORT}`;

// Test configuration
const configs = {
  light: {
    duration: 10,
    connections: 10,
    pipelining: 1,
    title: "Light Load (10 connections)",
  },
  medium: {
    duration: 10,
    connections: 100,
    pipelining: 1,
    title: "Medium Load (100 connections)",
  },
  heavy: {
    duration: 10,
    connections: 500,
    pipelining: 10,
    title: "Heavy Load (500 connections, pipelining 10)",
  },
};

// Endpoints to test
const endpoints = [
  {
    path: "/",
    name: "Health Check",
    method: "GET",
  },
  // Add more endpoints as needed
  // {
  //   path: '/api/v1/admin/auth/me',
  //   name: 'Get Admin Profile',
  //   method: 'GET',
  //   headers: {
  //     'Authorization': 'Bearer YOUR_TOKEN_HERE'
  //   }
  // }
];

async function runTest(endpoint, config) {
  console.log(`\n${"=".repeat(80)}`);
  console.log(
    `Testing: ${endpoint.name} (${endpoint.method} ${endpoint.path})`
  );
  console.log(`Load: ${config.title}`);
  console.log("=".repeat(80));

  const result = await autocannon({
    url: `${BASE_URL}${endpoint.path}`,
    method: endpoint.method,
    headers: endpoint.headers || {},
    connections: config.connections,
    duration: config.duration,
    pipelining: config.pipelining,
  });

  // Print summary
  console.log("\n📊 Results:");
  console.log(
    `  Total Requests:     ${result.requests.total.toLocaleString()}`
  );
  console.log(
    `  Requests/sec:       ${result.requests.average.toLocaleString()}`
  );
  console.log(
    `  Throughput:         ${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/s`
  );
  console.log(`  Latency (avg):      ${result.latency.mean.toFixed(2)} ms`);
  console.log(`  Latency (p50):      ${result.latency.p50.toFixed(2)} ms`);
  console.log(`  Latency (p95):      ${result.latency.p95.toFixed(2)} ms`);
  console.log(`  Latency (p99):      ${result.latency.p99.toFixed(2)} ms`);
  console.log(`  Errors:             ${result.errors}`);
  console.log(`  Timeouts:           ${result.timeouts}`);

  return result;
}

async function main() {
  const loadType = process.argv[2] || "light";
  const config = configs[loadType];

  if (!config) {
    console.error(`Unknown load type: ${loadType}`);
    console.error(`Available: light, medium, heavy`);
    process.exit(1);
  }

  console.log(`\n🚀 Performance Testing - ${config.title}`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Duration: ${config.duration}s per endpoint\n`);

  // Check if server is running
  try {
    const response = await fetch(BASE_URL);
    if (!response.ok) {
      throw new Error("Server not responding correctly");
    }
  } catch (error) {
    console.error(`❌ Server is not running at ${BASE_URL}`);
    console.error("Please start your server first with: bun run start");
    process.exit(1);
  }

  const results = [];

  // Run tests for each endpoint
  for (const endpoint of endpoints) {
    const result = await runTest(endpoint, config);
    results.push({
      endpoint: endpoint.name,
      result,
    });
  }

  // Print summary comparison
  console.log(`\n${"=".repeat(80)}`);
  console.log("📈 Summary");
  console.log("=".repeat(80));
  results.forEach(({ endpoint, result }) => {
    console.log(`\n${endpoint}:`);
    console.log(
      `  ${result.requests.average.toLocaleString()} req/s | ` +
        `${result.latency.mean.toFixed(2)}ms avg latency`
    );
  });

  console.log("\n✅ Performance testing completed!\n");
}

main().catch(console.error);

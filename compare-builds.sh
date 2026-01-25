#!/bin/bash

# Performance Comparison Script
# Compares bundled build vs structured build

set -e

echo "🔬 Build Performance Comparison Script"
echo "======================================"
echo ""

PORT=4000
PERF_DURATION=10
CONNECTIONS=100

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to wait for server
wait_for_server() {
    echo "⏳ Waiting for server to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:$PORT > /dev/null 2>&1; then
            echo "✅ Server is ready!"
            return 0
        fi
        sleep 1
    done
    echo "❌ Server failed to start"
    return 1
}

# Function to run performance test
run_perf_test() {
    local build_type=$1
    echo ""
    echo -e "${BLUE}Testing: $build_type${NC}"
    echo "--------------------------------"
    
    # Run autocannon
    bunx autocannon -c $CONNECTIONS -d $PERF_DURATION http://localhost:$PORT 2>&1 | tee /tmp/perf-$build_type.txt
    
    # Extract key metrics
    local rps=$(grep -A 1 "Req/Sec" /tmp/perf-$build_type.txt | tail -1 | awk '{print $2}')
    local latency=$(grep -A 1 "Latency" /tmp/perf-$build_type.txt | tail -1 | awk '{print $2}')
    
    echo ""
    echo -e "${GREEN}Summary - $build_type:${NC}"
    echo "  Requests/sec: $rps"
    echo "  Avg Latency: $latency ms"
}

# Backup current build
echo "📦 Backing up package.json..."
cp package.json package.json.backup

echo ""
echo "Test 1: Structured Build (Current - TypeScript Compiler)"
echo "========================================================="

# Build structured
echo "Building with tsc..."
bun run build

# Start server in background
echo "Starting server..."
NODE_ENV=production bun dist/index.js > /tmp/server-structured.log 2>&1 &
SERVER_PID=$!
sleep 2

if wait_for_server; then
    run_perf_test "Structured-TSC"
    kill $SERVER_PID 2>/dev/null || true
    sleep 2
fi

echo ""
echo "Test 2: Bundled Build (Bun Build)"
echo "=================================="

# Update build script temporarily
echo "Updating build script to use bun build..."
sed -i.bak 's|"build": "rm -rf dist && tsc"|"build": "rm -rf dist \&\& bun build src/index.ts --outdir dist --target bun"|' package.json

# Build bundled
echo "Building with bun build..."
bun run build

# Start server in background
echo "Starting server..."
NODE_ENV=production bun dist/index.js > /tmp/server-bundled.log 2>&1 &
SERVER_PID=$!
sleep 2

if wait_for_server; then
    run_perf_test "Bundled-Bun"
    kill $SERVER_PID 2>/dev/null || true
    sleep 2
fi

# Restore package.json
echo ""
echo "📝 Restoring package.json..."
mv package.json.backup package.json
rm -f package.json.bak

# Print comparison
echo ""
echo "======================================"
echo -e "${YELLOW}📊 Performance Comparison${NC}"
echo "======================================"
echo ""
echo "Structured (TSC):"
grep -A 5 "Stat.*Avg" /tmp/perf-Structured-TSC.txt | head -6
echo ""
echo "Bundled (Bun):"
grep -A 5 "Stat.*Avg" /tmp/perf-Bundled-Bun.txt | head -6

echo ""
echo "✅ Comparison complete!"
echo ""
echo "Logs available at:"
echo "  - /tmp/server-structured.log"
echo "  - /tmp/server-bundled.log"
echo "  - /tmp/perf-*.txt"

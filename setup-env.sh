#!/bin/bash

# Setup script to create .env from .env.example with random JWT_SECRET

if [ -f .env ]; then
  echo ".env already exists, skipping setup."
  exit 0
fi

if [ ! -f .env.example ]; then
  echo "Error: .env.example not found!"
  exit 1
fi

# Copy .env.example to .env
cp .env.example .env

# Generate random JWT_SECRET and replace placeholder
JWT_SECRET=$(openssl rand -base64 32)
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s/JWT_SECRET=your-secret-key-here/JWT_SECRET=$JWT_SECRET/" .env
else
  # Linux
  sed -i "s/JWT_SECRET=your-secret-key-here/JWT_SECRET=$JWT_SECRET/" .env
fi

echo ".env created from .env.example with random JWT_SECRET generated."

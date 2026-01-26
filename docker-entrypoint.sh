#!/bin/sh

# Docker entrypoint script to setup .env from .env.example if needed

if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    
    # Generate random JWT_SECRET and replace placeholder
    if command -v openssl >/dev/null 2>&1; then
      JWT_SECRET=$(openssl rand -base64 32)
      sed -i "s/JWT_SECRET=your-secret-key-here/JWT_SECRET=$JWT_SECRET/" .env
      echo "Generated random JWT_SECRET in .env"
    fi
  fi
fi

# Execute the main command
exec "$@"

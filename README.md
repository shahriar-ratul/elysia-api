# REST API with Authentication & Permission System

A production-ready REST API built with [Elysia](https://elysiajs.com/) featuring comprehensive authentication, role-based permissions with CASL, and extensive test coverage.

## ✨ Features

- 🔐 **Dual Authentication** - Separate admin and user authentication flows
- 🎯 **CASL Permissions** - Fine-grained access control with CASL
- 🗄️ **BigInt Support** - Scalable IDs using BigInt
- 📝 **Session Management** - Database-backed sessions with revocation
- 🧪 **Comprehensive Tests** - 86 tests with unit and E2E coverage
- 📊 **API Documentation** - Interactive Scalar docs at `/docs`
- 🚀 **Production Ready** - Logging, error handling, and security
- 🐳 **Docker Support** - Multi-stage Docker build with PostgreSQL

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Generate Prisma client
bun run db:generate

# Run database migrations
bun run db:migrate

# Seed database (optional)
bun run db:seed

# Run development server
bun dev

# Run tests
bun test

# Run tests with UI
bun test:ui

# Generate coverage
bun test:coverage
```

Server runs at: `http://localhost:4000`

## 🔌 API Endpoints

### Public

- `GET /` - Health check
- `GET /docs` - API documentation

### User Auth

- `POST /api/v1/auth/sign-up` - Register
- `POST /api/v1/auth/sign-in` - Login
- `GET /api/v1/auth/me` - Profile
- `POST /api/v1/auth/sign-out` - Logout

### Admin Auth

- `POST /api/v1/admin/auth/sign-in` - Login
- `GET /api/v1/admin/auth/me` - Profile
- `POST /api/v1/admin/auth/sign-out` - Logout

### Admin - User Management 🔒

- `GET /api/v1/admin/users` - List users
- `GET /api/v1/admin/users/:id` - Get user
- `DELETE /api/v1/admin/users/:id` - Delete user

### Admin - Role Management 🔒

- `GET /api/v1/admin/roles` - List roles
- `POST /api/v1/admin/roles` - Create role
- `GET /api/v1/admin/roles/:id` - Get role
- `PATCH /api/v1/admin/roles/:id` - Update role
- `POST /api/v1/admin/roles/:id/permissions` - Assign permissions
- `DELETE /api/v1/admin/roles/:id` - Delete role

### Admin - Permission Management 🔒

- `GET /api/v1/admin/permissions` - List permissions
- `GET /api/v1/admin/permissions/:id` - Get permission
- `POST /api/v1/admin/permissions` - Create permission

🔒 = Requires specific permission

## 🧪 Testing

### Test Coverage

- **86 test cases** (all passing ✅)
- **20+ endpoints covered**
- **Unit tests** for services (admin-auth, user-auth, role)
- **E2E tests** for all endpoints (health-check, user-auth, admin-auth, role-management, permission-management, user-management)
- **Permission checks** verified
- **Authentication flows** fully tested

### Running Tests

```bash
# All tests
bun test

# Watch mode
bun test:watch

# With UI
bun test:ui

# Coverage
bun test:coverage

# Specific file
bun test tests/e2e/user-auth.e2e.test.ts
```

## 🔐 Permission System

Built with [@casl/ability](https://casl.js.org/) for fine-grained access control.

### Actions

- `manage` - All actions
- `create`, `read`, `update`, `delete`
- `list`, `export`, `import`

### Subjects

- `User`, `Admin`, `Role`, `Permission`
- `Session`, `AuditLog`, `Settings`

### Example Usage

```typescript
import { adminAuth, requirePermission } from "./middleware/auth";
import { Action, Subject } from "./utils/permissions";

export const protectedRoute = new Elysia()
  .use(adminAuth)
  .use(requirePermission(Action.Delete, Subject.User))
  .delete("/users/:id", ({ params }) => {
    // Only admins with users.delete permission can access
    return { success: true };
  });
```

## 🗄️ Database

Uses Prisma with PrismaBox for multi-schema support.

### Schema Structure

- **Admin**: Admin users with roles
- **User**: Application users
- **Role**: Admin roles
- **Permission**: Individual permissions
- **Sessions**: Admin and user sessions
- **Junction tables**: Many-to-many relationships

### BigInt Support

All IDs use BigInt for scalability:

```typescript
// IDs returned as strings in API
{
  "id": "1234567890123456789"
}

// Convert for database queries
const userId = BigInt(params.id)
```

### Data Persistence & Backups

Database data is persisted using Docker named volumes (`rest-api-postgres-data`):

**Persistence Features:**

- ✅ **Data survives container restarts** - Volume persists independently
- ✅ **Data survives container removal** - Volume remains on host
- ✅ **Data survives application updates** - Volume is separate from containers
- ✅ **Named volume** - Explicitly named for easy management

**Volume Location:** `/var/lib/docker/volumes/rest-api-postgres-data/_data`

**Backup Commands:**

```bash
# Create backup (saves to ./backups/ directory)
bun run db:backup
# or
./backup-db.sh

# Restore from backup
bun run db:restore backups/rest-api-backup-YYYYMMDD_HHMMSS.sql.gz
# or
./restore-db.sh backups/rest-api-backup-YYYYMMDD_HHMMSS.sql.gz

# List backups
ls -lh backups/
```

**Automated Backups:**

```bash
# Add to crontab for daily backups at 2 AM
0 2 * * * cd /path/to/project && ./backup-db.sh

# With automatic cleanup of old backups (30+ days)
0 2 * * * cd /path/to/project && CLEANUP_OLD_BACKUPS=1 ./backup-db.sh
```

**Backup Features:**

- Compressed SQL dumps (saves space)
- Timestamped filenames
- Optional automatic cleanup of old backups
- Easy restore process

**⚠️ Important:** While the named volume ensures data persists, regular backups are essential for disaster recovery!

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh/) v1.3.4
- **Framework**: [Elysia](https://elysiajs.com/) v1.4.22
- **Database**: PostgreSQL 16 with Prisma 7.2.0
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Permissions**: [@casl/ability](https://casl.js.org/) v6.8.0
- **Testing**: [Vitest](https://vitest.dev/) v4.0.17
- **Logging**: Pino with Elysia logger
- **API Docs**: Scalar (via @elysiajs/openapi)
- **Containerization**: Docker with multi-stage builds

## 📦 Available Scripts

### Development

```bash
bun dev              # Start development server with watch mode
bun typecheck         # Type check without emitting files
bun build             # Build for production (typecheck + build)
bun build:fast        # Fast build without type checking
bun start             # Start production server
```

### Database

```bash
bun run db:migrate           # Run migrations
bun run db:seed              # Seed database
bun run db:generate          # Generate Prisma client
bun run db:push              # Push schema changes
bun run db:studio            # Open Prisma Studio
bun run db:migrate:deploy    # Deploy migrations (production)
bun run db:reset             # Reset database
bun run db:refresh           # Reset and seed database
bun run db:backup            # Create database backup
bun run db:restore           # Restore from backup
```

### Testing

```bash
bun test              # Run all tests
bun test:watch        # Run tests in watch mode
bun test:ui            # Run tests with UI
bun test:coverage     # Generate coverage report
```

### Docker

```bash
bun run docker:build      # Build Docker image
bun run docker:run        # Run Docker container
bun run docker:up         # Start with docker-compose
bun run docker:down       # Stop docker-compose
bun run docker:logs       # View logs
bun run docker:rebuild    # Rebuild and restart
```

### Code Quality

```bash
bun lint              # Run ESLint
bun lint:fix          # Fix ESLint issues and format
bun format            # Format code with Prettier
```

## 📁 Project Structure

```
app/
├── src/
│   ├── app.ts             # Main Elysia app configuration
│   ├── index.ts           # Application entry point
│   ├── middleware/        # Auth & permission middleware
│   │   ├── auth.ts        # Authentication middleware
│   │   └── ability.guard.ts # Permission guard
│   ├── modules/           # Feature modules
│   │   ├── admin/        # Admin user management
│   │   ├── admin-auth/   # Admin authentication
│   │   ├── user-auth/    # User authentication
│   │   ├── auth/         # Shared auth utilities
│   │   ├── role/         # Role management
│   │   └── permission/   # Permission management
│   ├── utils/            # Utilities
│   │   ├── logger.ts     # Pino logger
│   │   ├── jwt.ts        # JWT utilities
│   │   ├── session.ts    # Session management
│   │   ├── db.ts         # Prisma client
│   │   └── permissions/  # CASL abilities
│   ├── generated/        # Prisma generated types
│   └── types/            # TypeScript type definitions
├── tests/
│   ├── unit/             # Unit tests
│   │   └── services/    # Service unit tests
│   ├── e2e/              # E2E tests
│   │   ├── admin-auth.e2e.test.ts
│   │   ├── user-auth.e2e.test.ts
│   │   ├── role-management.e2e.test.ts
│   │   ├── permission-management.e2e.test.ts
│   │   ├── user-management.e2e.test.ts
│   │   └── health-check.e2e.test.ts
│   ├── helpers/          # Test utilities
│   │   ├── test-db.ts    # Database helpers
│   │   ├── api-client.ts # API client
│   │   └── request.ts    # Request helper
│   └── setup.ts          # Test setup
├── prisma/               # Database schemas & migrations
│   ├── schema/           # Prisma schema files
│   └── seedData/         # Seed data
├── dist/                 # Built files (generated)
├── Dockerfile            # Multi-stage Docker build
├── docker-compose.yml    # Docker Compose (development)
├── dokploy-compose.yml   # Docker Compose (Dokploy deployment)
├── docker-stack.yml      # Docker Swarm stack
├── docker-compose.swarm.yml # Extended Swarm config
├── deploy-swarm.sh       # Swarm deployment script
├── backup-db.sh          # Database backup script
├── restore-db.sh         # Database restore script
└── package.json          # Dependencies & scripts
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/test"

# Server
PORT=4000

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Logging (optional)
LOG_LEVEL="info"
NODE_ENV="development"
```

### Database Setup

```bash
# Run migrations
bun run db:migrate

# Seed database with initial data (roles, permissions, admin)
bun run db:seed

# Open Prisma Studio to view data
bun run db:studio
```

## 🚀 Deployment

### Dokploy (Self-Hosted Platform) ⭐

For easy self-hosted deployment with automatic SSL and domain management.

#### Quick Deployment

1. **In Dokploy UI:**
   - Create new application
   - Select "Docker Compose"
   - Use `dokploy-compose.yml` as compose file
   - Set environment variables (see below)
   - Configure domain for automatic SSL

2. **Required Environment Variables:**

   ```env
   JWT_SECRET=your-secret-key
   POSTGRES_PASSWORD=your-password
   DATABASE_URL=postgresql://postgres:your-password@postgres:5432/rest_api
   POSTGRES_USER=postgres
   POSTGRES_DB=rest_api
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d
   ```

3. **Deploy:**
   - Click "Deploy" in Dokploy UI
   - Dokploy handles building, SSL, and domain routing automatically

4. **Run Migrations (After First Deployment):**
   ```bash
   # In Dokploy UI: Go to your app → Exec → Select 'app' container
   bun run db:migrate:deploy
   bun run db:seed  # Optional
   ```

**Features:**

- ✅ One-click deployment
- ✅ Automatic SSL certificates (Let's Encrypt)
- ✅ Domain management via UI
- ✅ Built-in monitoring and logs
- ✅ Git integration
- ✅ Environment variable management
- ✅ Data persistence with named volumes

**Domain Configuration:**

- **Option A (Recommended):** Use Dokploy's domain management UI
  - Go to "Domains" section
  - Add your domain (e.g., `api.example.com`)
  - Configure DNS to point to Dokploy server
  - SSL is automatically provisioned

- **Option B:** Manual Traefik configuration
  - Uncomment Traefik labels in `dokploy-compose.yml`
  - Set `DOMAIN` environment variable
  - Configure DNS manually

**Updating Application:**

```bash
# Push changes to Git
git push

# In Dokploy UI: Click "Redeploy"
# Dokploy rebuilds and updates automatically
```

**Troubleshooting:**

- **Application won't start?** Check logs in Dokploy UI, verify all environment variables are set
- **Database connection failed?** Verify `DATABASE_URL` matches postgres service, check `POSTGRES_PASSWORD`
- **Domain not working?** Check DNS configuration, verify domain in Dokploy domains section

### Docker Swarm (Production)

For production deployments with high availability, use Docker Swarm.

#### Initial Setup

```bash
# 1. Initialize Swarm (on first manager node)
docker swarm init --advertise-addr <MANAGER_IP>

# 2. Add worker nodes (on each worker)
docker swarm join --token <WORKER_TOKEN> <MANAGER_IP>:2377

# 3. Create secrets
echo "postgresql://postgres:pass@postgres:5432/rest_api" | docker secret create database_url -
echo "your-jwt-secret" | docker secret create jwt_secret -
echo "postgres-password" | docker secret create postgres_password -

# 4. Deploy using the deployment script
./deploy-swarm.sh deploy

# Or deploy manually
docker stack deploy -c docker-stack.yml rest-api
```

#### Deployment Script Commands

```bash
# Initialize Swarm and create secrets
./deploy-swarm.sh init

# Build image
./deploy-swarm.sh build

# Full deployment
./deploy-swarm.sh deploy

# Update existing deployment
./deploy-swarm.sh update

# Scale app service to 5 replicas
./deploy-swarm.sh scale app 5

# View status
./deploy-swarm.sh status

# View logs
./deploy-swarm.sh logs app

# Remove stack
./deploy-swarm.sh remove
```

#### Environment Variables

Set these before running the script:

```bash
export STACK_NAME=rest-api
export IMAGE_NAME=rest-api:latest
export REGISTRY=registry.example.com  # Optional
export DATABASE_URL="postgresql://postgres:pass@postgres:5432/rest_api"
export JWT_SECRET="your-secret-key"
export POSTGRES_PASSWORD="your-password"
```

#### Monitoring & Management

```bash
# List all services
docker stack services rest-api

# View service details
docker service ps rest-api_app

# View service logs
docker service logs -f rest-api_app

# Scale services
docker service scale rest-api_app=5

# Update service
docker service update --image rest-api:v2.0 rest-api_app

# Rollback to previous version
docker service rollback rest-api_app
```

**Features:**

- ✅ High availability with multiple replicas (3 app replicas by default)
- ✅ Zero-downtime rolling updates
- ✅ Automatic failover and health checks
- ✅ Encrypted secret management
- ✅ Load balancing across nodes
- ✅ Resource limits and reservations
- ✅ Overlay network for service discovery

**Architecture:**

- **App Service**: 3 replicas across worker nodes
- **Postgres Service**: 1 replica on manager node
- **Overlay Network**: Secure communication between services
- **Secrets**: Encrypted at rest and in transit

### Using Docker Compose (Development)

For local development, use Docker Compose:

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f app
docker-compose logs -f postgres

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build

# Execute commands in container
docker-compose exec app bun run db:migrate
docker-compose exec postgres psql -U postgres -d rest_api
```

The application will be available at `http://localhost:4000` and PostgreSQL at `localhost:5432`.

**Note:** Database data persists in a named volume even if containers are stopped or removed.

### Docker Build

The project uses a multi-stage Docker build for optimized production images:

```bash
# Build Docker image
docker build -t rest-api .

# Run container
docker run -p 4000:4000 --env-file .env rest-api
```

### Manual Deployment

```bash
# Install dependencies
bun install

# Generate Prisma client
bun run db:generate

# Run migrations
bun run db:migrate:deploy

# Build application
bun run build

# Start server
bun start
```

## 📊 Performance

- **Request Logging**: Every request tracked with unique ID
- **Session Caching**: Efficient session validation
- **BigInt IDs**: Support for billions of records
- **Indexes**: Optimized database queries
- **Connection Pooling**: PrismaBox with connection reuse
- **Multi-stage Docker Build**: Optimized production images
- **TypeScript Type Checking**: Ensures type safety before build
- **SWC Build**: Fast compilation with Bun's native bundler

### Build Process

The project uses a multi-stage Docker build:

1. **Builder stage**: Installs dependencies, type checks, and builds the application
2. **Production stage**: Minimal image with only runtime dependencies and built files

This results in smaller, more secure production images.

### Docker Swarm Scripts

```bash
bun run swarm:init      # Initialize Swarm and create secrets
bun run swarm:deploy   # Full deployment
bun run swarm:update   # Update existing deployment
bun run swarm:status   # View stack status
bun run swarm:remove   # Remove stack
```

### Dokploy Scripts

```bash
bun run dokploy:compose   # Validate compose file
bun run dokploy:validate # Quiet validation
```

## 🔒 Security

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Session revocation
- ✅ IP tracking and user agent logging
- ✅ Input validation with Elysia schemas
- ✅ CASL for authorization
- ✅ Soft deletes with audit trail
- ✅ Non-root user in Docker containers
- ✅ Encrypted secrets in Docker Swarm
- ✅ Environment variable protection
- ✅ Health checks for automatic recovery

## 🐛 Troubleshooting

### Application Issues

**Application won't start:**

```bash
# Check logs
docker-compose logs app
# or in Dokploy: View logs in UI

# Verify environment variables
docker-compose exec app env | grep -E "DATABASE_URL|JWT_SECRET"

# Check database connection
docker-compose exec app bun run db:push
```

**Database connection failed:**

```bash
# Verify database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres pg_isready -U postgres

# Verify DATABASE_URL format
# Should be: postgresql://user:password@postgres:5432/dbname
```

**Health check failing:**

```bash
# Check if app is responding
curl http://localhost:4000/

# Check container health
docker ps --format "table {{.Names}}\t{{.Status}}"

# View health check logs
docker inspect rest-api | grep -A 10 Health
```

### Deployment Issues

**Docker Swarm:**

```bash
# Check service status
docker service ps rest-api_app --no-trunc

# View service logs
docker service logs rest-api_app

# Check secrets
docker secret ls

# Inspect service
docker service inspect rest-api_app --pretty
```

**Dokploy:**

- Check logs in Dokploy UI
- Verify all environment variables are set
- Ensure domain DNS is configured correctly
- Check Traefik logs if using manual domain config

### Database Issues

**Data not persisting:**

```bash
# Verify volume exists
docker volume ls | grep postgres-data

# Check volume location
docker volume inspect rest-api-postgres-data

# Verify volume is mounted
docker inspect rest-db | grep -A 5 Mounts
```

**Backup/Restore issues:**

```bash
# Verify container name
docker ps | grep rest-db

# Test backup manually
docker exec rest-db pg_dump -U postgres rest_api > test-backup.sql

# Check backup file
ls -lh backups/
```

## 📚 Quick Reference

### Common Commands

```bash
# Development
bun dev                    # Start dev server
bun test                   # Run tests
bun run db:migrate         # Run migrations
bun run db:seed            # Seed database

# Docker
docker-compose up -d       # Start services
docker-compose logs -f     # View logs
docker-compose down        # Stop services

# Database
bun run db:backup          # Create backup
bun run db:restore <file>  # Restore backup
bun run db:studio          # Open Prisma Studio

# Swarm
./deploy-swarm.sh deploy   # Deploy to Swarm
./deploy-swarm.sh status   # Check status
./deploy-swarm.sh logs app # View logs
```

### Environment Variables Reference

| Variable                 | Required | Default     | Description                  |
| ------------------------ | -------- | ----------- | ---------------------------- |
| `DATABASE_URL`           | Yes      | -           | PostgreSQL connection string |
| `JWT_SECRET`             | Yes      | -           | Secret key for JWT tokens    |
| `POSTGRES_PASSWORD`      | Yes      | -           | PostgreSQL password          |
| `PORT`                   | No       | 4000        | Application port             |
| `POSTGRES_USER`          | No       | postgres    | PostgreSQL username          |
| `POSTGRES_DB`            | No       | rest_api    | Database name                |
| `JWT_EXPIRES_IN`         | No       | 7d          | JWT expiration               |
| `JWT_REFRESH_EXPIRES_IN` | No       | 30d         | Refresh token expiration     |
| `NODE_ENV`               | No       | development | Environment mode             |

## 🤝 Contributing

1. Write tests for new features
2. Maintain 80%+ coverage
3. Follow existing code style
4. Update documentation
5. Ensure all tests pass

## 📝 License

[Your License Here]

## 🙏 Acknowledgments

- [Elysia](https://elysiajs.com/) - Web framework
- [Bun](https://bun.sh/) - JavaScript runtime
- [CASL](https://casl.js.org/) - Authorization library
- [Vitest](https://vitest.dev/) - Testing framework
- [Prisma](https://www.prisma.io/) - Database toolkit

---

**Built with ❤️ using Bun and Elysia**

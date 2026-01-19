# REST API with Authentication & Permission System

A production-ready REST API built with [Elysia](https://elysiajs.com/) featuring comprehensive authentication, role-based permissions with CASL, and extensive test coverage.

## ✨ Features

- 🔐 **Dual Authentication** - Separate admin and user authentication flows
- 🎯 **CASL Permissions** - Fine-grained access control with CASL
- 🗄️ **BigInt Support** - Scalable IDs using BigInt
- 📝 **Session Management** - Database-backed sessions with revocation
- 🧪 **Comprehensive Tests** - 75+ tests with unit and E2E coverage
- 📊 **API Documentation** - Interactive Scalar docs at `/docs`
- 🚀 **Production Ready** - Logging, error handling, and security

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Run tests
bun test

# Run tests with UI
bun test:ui

# Generate coverage
bun test:coverage
```

Server runs at: `http://localhost:3000`

## 📚 Documentation

- **[AUTH_SYSTEM.md](./AUTH_SYSTEM.md)** - Complete authentication guide
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - API testing with examples
- **[TEST_DOCUMENTATION.md](./TEST_DOCUMENTATION.md)** - Test suite documentation
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Feature summary

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
- **75+ test cases**
- **20+ endpoints covered**
- **80%+ code coverage**
- Unit tests for services
- E2E tests for all endpoints
- Permission checks verified

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
import { adminAuth, requirePermission } from './middleware/auth'
import { Action, Subject } from './utils/permissions'

export const protectedRoute = new Elysia()
  .use(adminAuth)
  .use(requirePermission(Action.Delete, Subject.User))
  .delete('/users/:id', ({ params }) => {
    // Only admins with users.delete permission can access
    return { success: true }
  })
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

## 🛠️ Tech Stack

- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [Elysia](https://elysiajs.com/)
- **Database**: PostgreSQL with Prisma
- **Authentication**: JWT + bcrypt
- **Permissions**: [@casl/ability](https://casl.js.org/)
- **Testing**: [Vitest](https://vitest.dev/)
- **Logging**: Pino
- **API Docs**: Scalar

## 📁 Project Structure

```
app/
├── src/
│   ├── middleware/         # Auth & permission middleware
│   ├── modules/            # Feature modules
│   │   ├── admin/         # Admin user management
│   │   ├── admin-auth/    # Admin authentication
│   │   ├── user-auth/     # User authentication
│   │   ├── role/          # Role management
│   │   └── permission/    # Permission management
│   ├── utils/             # Utilities
│   │   ├── logger.ts      # Logging
│   │   ├── jwt.ts         # JWT utilities
│   │   ├── session.ts     # Session management
│   │   └── permissions/   # CASL abilities
│   └── index.ts           # App entry
├── tests/
│   ├── unit/              # Unit tests
│   ├── e2e/               # E2E tests
│   └── helpers/           # Test utilities
├── prisma/                # Database schemas
└── docs/                  # Documentation
```

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Logging
LOG_LEVEL="info"
NODE_ENV="development"
```

## 🚀 Deployment

### Using Docker

```dockerfile
FROM oven/bun:latest
WORKDIR /app
COPY . .
RUN bun install --production
CMD ["bun", "src/index.ts"]
```

### Build & Run

```bash
# Install production dependencies
bun install --production

# Run migrations
bun prisma migrate deploy

# Start server
bun src/index.ts
```

## 📊 Performance

- **Request Logging**: Every request tracked with unique ID
- **Session Caching**: Efficient session validation
- **BigInt IDs**: Support for billions of records
- **Indexes**: Optimized database queries
- **Connection Pooling**: PrismaBox with connection reuse

## 🔒 Security

- ✅ Password hashing with bcrypt
- ✅ JWT-based authentication
- ✅ Session revocation
- ✅ IP tracking and user agent logging
- ✅ Input validation with Elysia schemas
- ✅ CASL for authorization
- ✅ Soft deletes with audit trail

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

# Multi-Tenant SaaS API 🚀

A professional, production-ready Multi-Tenant SaaS backend built with **NestJS**, **Prisma**, and **PostgreSQL**. This API features robust authentication with JWT session rotation, strict tenant isolation, and granular Role-Based Access Control (RBAC).

## 🌟 Key Features

- **Strict Multi-Tenancy**: Automated tenant context extraction via `x-tenant-id` header or subdomain.
- **Advanced Auth**: JWT Access & Refresh Token system with **Refresh Token Rotation**.
- **RBAC (Role Based Access Control)**: Pre-configured roles: `ADMIN`, `MANAGER`, and `DEVELOPER`.
- **Tenant Isolation**: Service-layer IDOR protection ensuring users only access their own organization's data.
- **High-Performance Logging**: JSON logging using `Pino` with automated log splitting and rotation.
- **API Documentation**: Interactive Swagger UI at `/api/docs`.
- **Security First**: Global protection with `Helmet`, `Compression`, `Throttler`, and `Strict Guards`.

---

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Logging**: [Pino](https://github.com/pinojs/pino)
- **Validation**: [Class Validator](https://github.com/typestack/class-validator)
- **Documentation**: [Swagger (OpenAPI 3.0)](https://swagger.io/)

---

## 🚦 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory and add the following:

```env
# Server
PORT=3000

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/multi_tenant_db?schema=public"

# JWT Secrets
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
```

### 3. Database Setup

Synchronize the database schema and generate the Prisma Client:

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed Initial Data

Populate the database with a default tenant and Admin user:

```bash
npm run seed
```

---

## 🏃 Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

---

## 🧪 Testing & Documentation

- **Swagger UI**: Accessible at `http://localhost:3000/api/docs`
- **Unit Tests**: `npm run test`
- **E2E Tests**: `npm run test:e2e`

---

## 📂 Project Structure

```text
src/
├── auth/           # Authentication logic (JWT, Strategies, Guards)
├── common/         # Global decorators, filters, guards, middleware
├── prisma/         # Prisma Service and Module
├── types/          # Global TS interfaces and types
├── users/          # User management module
└── main.ts         # Application entry point
```

---

## 📝 Author

- **Author**: Nazeem Khan

## 📄 License

This project is [UNLICENSED](LICENSE).

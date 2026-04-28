# Boilerplate & Best Practices Implementation Plan

This document summarizes the best practices and configurations found in the `alvianzf/introduction-to-nest` and `thoriqnf/madrid-nest` repositories, and outlines a step-by-step TODO list to implement them into the current project (`crack-be-khankhanfauzan`).

## Summary of Findings

### 1. Architecture & Setup

- **Global Prefix:** Standardized to `api/v1` for all routes.
- **Config Module:** Centralized environment configuration using `ConfigModule.forRoot({ isGlobal: true })`.
- **Custom Config Provider:** Use of a dedicated `AppConfigProvider` class/service for strict typing of config variables.

### 2. Security & Validation

- **Global Pipes:** `ValidationPipe` with `{ whitelist: true, forbidNonWhitelisted: true, transform: true }` to automatically clean up and transform incoming DTOs.
- **Helmet & Compression:** Essential for HTTP header security and payload compression.
- **Rate Limiting:** Instead of using raw `express-rate-limit`, the NestJS ecosystem prefers the native `@nestjs/throttler` package with `ThrottlerModule` and `ThrottlerGuard` mapped to `APP_GUARD`.
- **Advanced Authentication:**
  - Implementation of **Refresh Token Strategy** (`RtStrategy`).
  - Separation of guards (`JwtAuthGuard`, `RefreshAuthGuard`, `RolesGuard`).
  - Storing and validating hashed refresh tokens in the database.
  - Making authentication global via `APP_GUARD` and using `@Public()` decorator to bypass it where necessary.

### 3. Middlewares & Exception Handling

- **NestJS Native Middlewares:** Moving raw Express middlewares (like request tracking and logging) into proper NestJS classes (e.g., `LoggerMiddleware`, `RequestTrackingMiddleware`) and applying them in `AppModule.configure()`.
- **Global Exception Filter:** A custom `HttpExceptionFilter` to catch and normalize error responses (envelope pattern).

### 4. Database (Prisma)

- **Nested Writes & Relations:** Heavy use of Prisma's `createMany`, `connect`, and deep `include`s for 1-to-1, 1-to-many, and many-to-many relationships.
- **Seeding & Migrations:** Clear separation of seeding scripts (`seed.ts`) and migration flows.

---

## Step-by-Step Implementation TODO List

### Phase 1: Refactor Middlewares & Security

- [x] **1.1 Migrate Rate Limiter:** Replace `express-rate-limit` in `main.ts` with `@nestjs/throttler` in `AppModule` (using `ThrottlerModule.forRoot` and `APP_GUARD`).
- [x] **1.2 Create Native NestJS Middlewares:** Refactor the raw `uuid` request tracking and `morgan` logging from `main.ts` into a dedicated `RequestTrackingMiddleware` and `LoggerMiddleware`.
- [x] **1.3 Apply Middlewares in AppModule:** Implement `NestModule` in `AppModule` and use `consumer.apply().forRoutes('*')` for the new middlewares.

### Phase 2: Advanced Authentication (JWT & Refresh Tokens)

- [x] **2.1 Global JWT Guard:** Register `JwtAuthGuard` as an `APP_GUARD` in `AppModule` to protect all routes by default.
- [x] **2.2 Public Decorator:** Create a `@Public()` decorator to bypass the global JWT guard for endpoints like Login/Register.
- [x] **2.3 Refresh Token Strategy:** Implement `RtStrategy` for extracting refresh tokens from headers.
- [x] **2.4 Refresh Token Storage:** Update the `User` Prisma schema to store `hashedRt` and implement the logic in `AuthService` to update/revoke it.
- [x] **2.5 Roles Guard:** Implement a `RolesGuard` and register it as an `APP_GUARD` for authorization.

### Phase 3: Configuration & Prisma Optimizations

- [x] **3.1 Config Provider:** Replaced `common/config/app-config.provider.ts` with direct `process.env` usage per user request for simplicity.
- [x] **3.2 Prisma Seeding:** Ensure `prisma/seed.ts` is robustly handling initial data (Users, Profiles, Admin roles).
- [x] **3.3 Prisma Advanced Queries:** Audit existing services (e.g., `RoomsService`, `FacilitiesService`) to use `connect` and `createMany` where applicable for nested relations.

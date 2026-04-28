# Backend Features & Implementation Plan (Emerald Kos)

This document outlines the missing features and implementation steps for the Backend (`crack-be-khankhanfauzan`) of the Emerald Kos Booking Management System. It provides a step-by-step TODO list to complete the core business logic, ensuring security, performance, and best practices.

## 1. Missing Features & TODO List

### Phase 1: Bookings & Room Availability

- [x] **TODO 1.1 : Bookings Module Implementation**
  - **File:** `src/modules/bookings/bookings.service.ts`
  - **Action:** Implement `createBooking` logic. Must include checking room availability (prevent double-booking), calculating total price based on duration (daily, weekly, monthly), and setting initial status to `pending`.
- [x] **TODO 1.2 : Room Availability Service**
  - **File:** `src/modules/rooms/rooms.service.ts`
  - **Action:** Add a method `checkAvailability(roomId, startDate, endDate)` that queries existing bookings to ensure the room is free for the requested dates.
- [x] **TODO 1.3 : Booking Status Management (Admin & Cron)**
  - **File:** `src/modules/bookings/bookings.service.ts`
  - **Action:** Add methods for Admins to approve/reject bookings. Create a Cron Job (using `@nestjs/schedule`) to automatically cancel `pending` bookings if not confirmed/paid within 24 hours.

### Phase 2: Invoices & Payment Transactions

- [ ] **TODO 2.1 : Automated Invoice Generation**
  - **File:** `src/modules/invoices/invoices.service.ts`
  - **Action:** Hook into the booking creation process. When a booking is created (or approved), automatically generate an `Invoice` record with `dueDate` and `amount`.
- [ ] **TODO 2.2 : Transaction & Payment Proof Upload**
  - **File:** `src/modules/transactions/transactions.controller.ts`
  - **Action:** Implement `uploadPaymentProof` endpoint. Use `Multer` to handle file uploads (preferably to a cloud storage like AWS S3 or Cloudinary, but local storage for MVP).
- [ ] **TODO 2.3 : Payment Verification (Admin)**
  - **File:** `src/modules/transactions/transactions.service.ts`
  - **Action:** Implement `verifyPayment(transactionId, status)`. If approved, automatically update the related `Invoice` status to `paid` and the `Booking` status to `confirmed`.

### Phase 3: Maintenances (Complaints) & Reviews

- [ ] **TODO 3.1 : Maintenances Module (Tenant Complaints)**
  - **File:** `src/modules/maintenances/maintenances.service.ts`
  - **Action:** Implement endpoints for Tenants to submit complaints (with optional photo upload) and for Admins to update the status (`pending`, `in_progress`, `resolved`).
- [ ] **TODO 3.2 : Reviews & Ratings**
  - **File:** `src/modules/reviews/reviews.service.ts`
  - **Action:** Implement `createReview`. Add validation to ensure a Tenant can only review a room they have successfully booked and completed the stay for.

### Phase 4: Chat (Conversations & Messages)

- [ ] **TODO 4.1 : Chat Module & WebSockets**
  - **File:** `src/modules/chat/chat.gateway.ts`
  - **Action:** Implement real-time messaging between Admins and Tenants using `@nestjs/websockets` (Socket.io).
- [ ] **TODO 4.2 : Message Persistence**
  - **File:** `src/modules/chat/chat.service.ts`
  - **Action:** Save all WebSocket messages to the `Message` and `Conversation` Prisma models to keep chat history.

### Phase 5: Notifications

- [ ] **TODO 5.1 : Notification System**
  - **File:** `src/modules/notifications/notifications.service.ts`
  - **Action:** Create a centralized service to dispatch notifications. Trigger these when: a booking is approved, an invoice is due, or a maintenance request is updated. Emit via WebSockets for real-time FE updates.

---

## 2. Best Practices & Recommendations

### 1. File Uploads & Storage

- **Avoid Local Storage for Production:** While `Multer` saving to a local `./uploads` folder is fine for development, it will break if deployed to serverless environments (like Vercel or Railway) or scaled horizontally.
- **Recommendation:** Integrate an S3-compatible storage (AWS S3, MinIO, or Cloudinary). Create a shared `StorageModule` that handles file uploads and returns the public URL to be saved in the database.

### 2. Transactional Integrity (Database)

- **Problem:** Creating a booking involves creating the `Booking` record, creating an `Invoice`, and possibly updating `Room` status. If one fails, you get orphaned data.
- **Recommendation:** Use **Prisma Interactive Transactions** (`prisma.$transaction`). Wrap the entire booking creation flow in a transaction so it completely rolls back if any step fails.

### 3. Background Jobs (Cron)

- **Use Case:** Boarding houses need automated tasks (e.g., reminding tenants 3 days before rent is due, cancelling unpaid bookings).
- **Recommendation:** Use `@nestjs/schedule`. Create a `TasksModule` with a `CronService`.
  ```typescript
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleOverdueInvoices() { ... }
  ```

### 4. Data Validation & Transformation

- **Strict Validation:** Ensure `ValidationPipe` is globally configured with `whitelist: true` and `forbidNonWhitelisted: true`. This prevents malicious users from sending unexpected fields (like manually setting `status: 'paid'` during invoice creation).
- **Custom Validators:** Create custom Class-Validator decorators for specific business rules (e.g., `@IsDateAfter('startDate')` for booking `endDate`).

### 5. Pagination & Meta Standards

- **Consistency:** As noted in the core memories, strictly enforce the response envelope pattern for all list endpoints: `{ status, message, data, meta: { totalItems, page, perPage, totalPages } }`.
- **Recommendation:** Create a generic `PaginationDto` that all list DTOs inherit from, ensuring `page` and `limit` are always parsed correctly.

### 6. Security & Rate Limiting

- **Throttling:** Ensure `@nestjs/throttler` is actively protecting endpoints like login, registration, and file uploads to prevent brute-force and DDoS attacks.
- **Role-Based Access Control (RBAC):** Ensure the `@Roles('admin')` decorator is rigorously applied to all sensitive endpoints (e.g., verifying payments, deleting users).

### 7. Soft Deletes

- **Financial Records:** Never hard-delete `Invoices`, `Transactions`, or `Bookings`.
- **Recommendation:** If not already in the schema, consider adding an `isDeleted` or `deletedAt` field to these models. Implement a Prisma Middleware or Extension to automatically filter out soft-deleted records on `findMany` queries.

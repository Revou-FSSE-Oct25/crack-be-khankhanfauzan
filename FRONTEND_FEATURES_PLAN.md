# Frontend Features & Integration Plan (Emerald Kos)

This document outlines the missing features in the Frontend (`crack-fe-khankhanfauzan`) for the Emerald Kos Booking Management System, providing a step-by-step TODO list to integrate with the backend, split by specific roles (Admin / Tenant).

## 1. Missing Features & TODO List

### Phase 1: Bookings (Pemesanan)
- [ ] **TODO 1.1 : Create Bookings API Service**
  - **File to create:** `crack-fe-khankhanfauzan/services/bookings.ts`
  - **Action:** Add `getBookings`, `getBookingById`, `createBooking`, `updateBookingStatus`.
- [ ] **TODO 1.2 : Admin Bookings Page Integration**
  - **File to update:** `crack-fe-khankhanfauzan/app/(admin)/admin/bookings/page.tsx`
  - **Action:** Replace hardcoded `<tr>` data (e.g., `BK-001`, `Aulia N`) with dynamic data fetched from `getBookings()`.
- [ ] **TODO 1.3 : Tenant Room Booking Flow**
  - **File to update:** `crack-fe-khankhanfauzan/app/rooms/[id]/page.tsx` (or the booking modal component)
  - **Action:** Add booking form submission calling `createBooking()`.
- [ ] **TODO 1.4 : Tenant Booking History**
  - **File to update:** `crack-fe-khankhanfauzan/app/(user)/user/bookings/page.tsx`
  - **Action:** Fetch and display data using `getUserBookings()`.

### Phase 2: Invoices & Payments (Tagihan & Pembayaran)
- [ ] **TODO 2.1 : Create Invoices & Transactions API Service**
  - **File to create:** `crack-fe-khankhanfauzan/services/invoices.ts` and `crack-fe-khankhanfauzan/services/transactions.ts`
  - **Action:** Add `getInvoices`, `uploadPaymentProof`, `confirmPayment`.
- [ ] **TODO 2.2 : Admin Invoices Management**
  - **File to update:** `crack-fe-khankhanfauzan/app/(admin)/admin/invoices/page.tsx`
  - **Action:** Replace static table with dynamic `getInvoices()` data. Add "Confirm Payment" button logic.
- [ ] **TODO 2.3 : Tenant Payments Page**
  - **File to update:** `crack-fe-khankhanfauzan/app/(user)/user/payments/page.tsx`
  - **Action:** Add file upload form for payment proof and integrate with the API.

### Phase 3: Maintenances / Complaints (Komplain)
- [ ] **TODO 3.1 : Create Maintenances API Service**
  - **File to create:** `crack-fe-khankhanfauzan/services/maintenances.ts`
  - **Action:** Add `getMaintenances`, `createMaintenance`, `updateMaintenanceStatus`.
- [ ] **TODO 3.2 : Tenant Submit Complaint**
  - **File to update:** `crack-fe-khankhanfauzan/app/(user)/user/complaints/page.tsx`
  - **Action:** Add a form to submit new complaints (Title, Description, Photo) calling `createMaintenance()`.
- [ ] **TODO 3.3 : Admin Maintenances Management**
  - **File to update:** `crack-fe-khankhanfauzan/app/(admin)/admin/maintenances/page.tsx`
  - **Action:** Render dynamic complaints list and add a dropdown to change status (Pending -> In Progress -> Resolved).

### Phase 4: Reviews & Chat (Ulasan & Pesan)
- [ ] **TODO 4.1 : Create Reviews & Conversations API Service**
  - **File to create:** `crack-fe-khankhanfauzan/services/reviews.ts` and `crack-fe-khankhanfauzan/services/conversations.ts`
- [ ] **TODO 4.2 : Tenant Leave Review**
  - **File to update:** `crack-fe-khankhanfauzan/app/(user)/user/reviews/page.tsx`
  - **Action:** Implement star rating and comment form for past bookings.
- [ ] **TODO 4.3 : Admin & Tenant Chat Interface**
  - **File to create:** `crack-fe-khankhanfauzan/app/(user)/user/chat/page.tsx` & `crack-fe-khankhanfauzan/app/(admin)/admin/chat/page.tsx`
  - **Action:** Build a real-time or polling chat interface using `getMessages` and `sendMessage`.

### Phase 5: Profile & Notifications
- [ ] **TODO 5.1 : User Profile Update**
  - **File to update:** `crack-fe-khankhanfauzan/app/(user)/user/profile/page.tsx`
  - **Action:** Add form to update `fullName`, `whatsappNumber`, and upload avatar calling `updateProfile()`.
- [ ] **TODO 5.2 : Notification Center**
  - **File to create/update:** `crack-fe-khankhanfauzan/components/NotificationsPopover.tsx`
  - **Action:** Fetch unread notifications periodically or via WebSockets to alert users of booking approvals or new invoices.

---

## 2. Best Practices & Recommendations

### Frontend (Next.js App Router)
1. **Data Fetching:** Use **Server Components** for fetching lists (e.g., `getBookings` inside `page.tsx`) to improve SEO and initial load times. For client-side fetching where real-time updates are needed (like Chat/Notifications), use **React Query (TanStack)** or **SWR**.
2. **Server Actions:** Handle form submissions (Create Booking, Submit Complaint) using Next.js Server Actions (`use server`) instead of creating intermediate `/api` routes in Next.js.
3. **Form Validation:** Use `react-hook-form` paired with `zod` for robust client-side validation. Define schemas that perfectly match the NestJS backend DTOs.
4. **Type Safety:** Generate TypeScript interfaces from your NestJS Swagger spec (using `openapi-typescript-codegen`) to ensure the FE is always strictly typed according to the BE responses.
5. **Middleware Routing:** Protect `(admin)` and `(user)` routes in `middleware.ts`. Ensure users with `role: 'tenant'` cannot access `/admin/*` and vice versa.

### Backend (NestJS)
1. **File Uploads:** Implement `Multer` combined with a cloud storage service (e.g., AWS S3, Cloudinary) to handle Payment Proofs (`Transaction` model), Maintenance Photos, and User Avatars. Avoid storing files locally on the server.
2. **Cron Jobs:** Use `@nestjs/schedule` to implement automated tasks. For example, automatically canceling `Pending` bookings if the invoice is not paid within 24 hours.
3. **Standardized Meta Pagination:** Ensure *every* GET list endpoint returns a consistent `{ data: [...], meta: { totalItems, page, totalPages } }` envelope, which makes building the FE Pagination component much easier.
4. **Soft Deletes:** Add a `@default(false)` `isDeleted` field to `Booking` and `Invoice` models. Use Prisma middleware to filter them out. This prevents accidental loss of historical financial records.

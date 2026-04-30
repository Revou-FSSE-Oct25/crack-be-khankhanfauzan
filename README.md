# Emerald House (RevoU CRACK Project) - Backend API

Booking Management System for Boarding House (Kos-kosan).

---

## 🔄 Application Flow Process (Step-by-Step)

Dokumentasi ini menjelaskan alur proses bisnis utama dari sistem manajemen booking Emerald House dari awal hingga akhir.

### 1. Registrasi & Autentikasi (Authentication)

- **Tenant Baru:** Calon penghuni (Tenant) mendaftar melalui endpoint `POST /auth/register`. Sistem otomatis memberikan role `tenant`.
- **Login:** Tenant atau Admin masuk melalui `POST /auth/login`. Sistem mengembalikan JWT Access Token dan Refresh Token. Akses Token ini digunakan (di-set sebagai _Bearer Token_) untuk mengakses endpoint yang dilindungi (Protected Routes).

### 2. Eksplorasi & Pemilihan Kamar (Room Browsing)

- **Melihat Denah:** Frontend dapat memanggil `GET /rooms` dengan filter `building` (misal: "Emerald House"). Data yang dikembalikan mengandung koordinat `gridRow` dan `gridColumn` untuk me-render UI ala "kursi bioskop".
- **Mengecek Ketersediaan:** Tenant memilih kamar dan tanggal masuk-keluar. Frontend memanggil `GET /rooms/:id/availability?startDate=...&endDate=...` untuk memastikan tidak ada _overlapping_ (bentrok) jadwal dengan penghuni lain.

### 3. Proses Booking (Reservation)

- **Membuat Booking:** Jika tersedia, Tenant mengirimkan permintaan booking melalui `POST /bookings` dengan durasi sewa (harian, mingguan, bulanan, tahunan).
- **Kalkulasi Harga:** Backend otomatis menghitung total harga berdasarkan tipe durasi (`rentType`) yang dipilih dan menyetel status booking menjadi `pending_payment`.

### 4. Pembayaran & Verifikasi Admin (Payment & Approval)

- **Upload Bukti Pembayaran (Mendatang):** Tenant melakukan pembayaran (transfer) dan mengunggah bukti bayar.
- **Verifikasi Admin:** Admin melihat daftar booking yang berstatus `pending_payment` (`GET /bookings?status=pending_payment`).
- **Approval/Reject:**
  - Jika pembayaran valid, Admin memanggil `PATCH /bookings/:id/approve`. Status booking berubah menjadi `confirmed` dan status kamar terkait berubah menjadi `occupied`.
  - Jika pembayaran tidak valid/ditolak, Admin memanggil `PATCH /bookings/:id/reject`. Status booking berubah menjadi `cancelled`.
- **Auto-Cancel (Cron Job):** Jika Tenant tidak menyelesaikan pembayaran dalam waktu 24 jam, sistem Cron Job yang berjalan di _background_ setiap jam akan membatalkan (cancel) booking tersebut secara otomatis.

### 5. Masa Tinggal & Maintenance (Stay & Operations)

- **Cek Status:** Selama masa sewa, Tenant dan Admin dapat melihat rincian kamar, tagihan bulan berikutnya (Invoices), dan riwayat pembayaran.
- **Maintenance (Mendatang):** Jika ada kerusakan fasilitas (AC mati, dll), Tenant dapat melaporkan masalah ke sistem agar ditindaklanjuti oleh Admin.

### 6. Checkout & Review

- **Selesai Masa Sewa:** Saat durasi sewa berakhir, status booking dapat diselesaikan (`completed`) dan kamar kembali berstatus `available`.
- **Ulasan (Review):** Tenant dapat memberikan rating dan ulasan (`POST /reviews`) terhadap kamar yang mereka tempati.

---

## 📄 Pagination & Filtering Documentation

Sistem API menggunakan format respons yang terstandarisasi untuk semua endpoint yang mengembalikan daftar/list data (contohnya: Rooms, Bookings, Users, Facilities). Endpoint ini secara bawaan telah dilengkapi dengan fitur **Pagination** dan **Filtering**.

### 1. Struktur Respons Standar (Meta Data)

Setiap endpoint list akan mengembalikan objek `meta` yang berisi informasi pagination:

```json
{
  "status": 200,
  "message": "Data fetched successfully",
  "data": [ ... ],
  "meta": {
    "totalItems": 100,  // Total keseluruhan data yang sesuai filter
    "page": 1,          // Halaman saat ini
    "perPage": 10,      // Jumlah data per halaman
    "totalPages": 10    // Total keseluruhan halaman
  }
}
```

_Note: Beberapa endpoint (seperti Rooms) mungkin mengembalikan properti `meta` tambahan seperti `totalRooms`, `totalAvailable`, dll._

### 2. Penggunaan Pagination Umum

Parameter query berikut dapat digunakan di **semua** endpoint yang mendukung list:

- `page` (number): Halaman yang ingin diakses (default: `1`)
- `perPage` (number): Jumlah data yang ingin ditampilkan per halaman (default: `10`)

**Contoh:**
`GET /api/v1/rooms?page=2&perPage=5`

---

### 3. Dokumentasi Endpoint Filtering & Pagination

#### A. Rooms (`GET /api/v1/rooms`)

Digunakan untuk mendapatkan daftar kamar. Mendukung filter spesifik kamar.

- **Query Parameters:**
  - `floor` (number): Filter berdasarkan lantai (misal: `2`).
  - `status` (string): Filter berdasarkan status ketersediaan (`available`, `unavailable`, `occupied`).
  - `roomType` (string): Filter berdasarkan tipe kamar (`standard`, `deluxe`, dll).
  - `price` (string): Mengurutkan berdasarkan harga bulanan (`asc` atau `desc`).
- **Contoh Penggunaan:**
  - Mendapatkan kamar di lantai 2 yang tersedia:
    `GET /api/v1/rooms?floor=2&status=available&page=1&perPage=10`
  - Mengurutkan semua kamar dari harga termurah:
    `GET /api/v1/rooms?price=asc`

#### B. Bookings (`GET /api/v1/bookings`)

Digunakan untuk mendapatkan daftar transaksi booking (Membutuhkan Bearer Token - Admin/Tenant).

- **Query Parameters:**
  - `status` (string): Filter berdasarkan status transaksi (`pending_payment`, `confirmed`, `cancelled`, `completed`).
  - `tenantId` (string/uuid): Filter transaksi milik tenant spesifik.
  - `roomId` (string/uuid): Filter transaksi untuk kamar spesifik.
- **Contoh Penggunaan:**
  - Melihat semua transaksi yang belum dibayar di halaman 1:
    `GET /api/v1/bookings?status=pending_payment&page=1&perPage=20`

#### C. Users (`GET /api/v1/users`)

Digunakan untuk mendapatkan daftar pengguna/tenant (Membutuhkan Bearer Token - Admin Only).

- **Query Parameters:**
  - `role` (string): Filter berdasarkan role (`admin` atau `tenant`).
  - `search` (string): Mencari pengguna berdasarkan nama lengkap, nomor WhatsApp, atau email (case-insensitive).
- **Contoh Penggunaan:**
  - Mencari tenant dengan nama "Fauzan":
    `GET /api/v1/users?role=tenant&search=Fauzan`

#### D. Facilities (`GET /api/v1/facilities`)

Digunakan untuk mendapatkan daftar fasilitas yang tersedia.

- **Query Parameters:**
  - `name` (string): Pencarian nama fasilitas (case-insensitive).
- **Contoh Penggunaan:**
  - Mencari fasilitas yang mengandung kata "AC":
    `GET /api/v1/facilities?name=AC&page=1&perPage=10`

---

## Swagger API Docs

Semua dokumentasi lengkap, termasuk model DTO, validasi form, dan contoh respon dapat diakses melalui Swagger UI:
👉 **`http://localhost:3001/api`** (Jika dijalankan secara lokal).

---

## 💳 Phase 2: Invoices & Payment Transactions

Sistem kini mendukung pembuatan Invoice otomatis dan alur pembayaran lengkap.

### 1. Automated Invoice Generation

- **Trigger:** Setiap kali Tenant membuat Booking baru (`POST /bookings`), sistem secara otomatis akan membuat record `Invoice` dengan status `unpaid`.
- **Due Date:** Tenggat waktu pembayaran diatur otomatis 24 jam sejak Booking dibuat.
- **Endpoint:** Tenant dapat melihat tagihan mereka melalui `GET /invoices`.

### 2. Upload Payment Proof (Tenant)

- **Proses:** Setelah mentransfer dana, Tenant wajib mengunggah bukti transfer.
- **Endpoint:** `POST /transactions/upload-proof`
- **Format:** Menggunakan `multipart/form-data` dengan field:
  - `invoiceId` (string)
  - `amount` (number)
  - `paymentMethod` (string)
  - `file` (file gambar: jpg/jpeg/png)
- **Hasil:** Status transaksi menjadi `pending` dan menunggu verifikasi Admin. File disimpan di `/uploads` dan dapat diakses publik (Static Serving).

### 3. Payment Verification (Admin)

- **Proses:** Admin mengecek mutasi rekening dan memverifikasi bukti yang diunggah Tenant.
- **Endpoint:** `PATCH /transactions/:id/verify`
- **Payload:** `{ "status": "verified" | "rejected", "rejectReason": "..." }`
- **Otomasi:** Jika Admin mengirim status `verified`, sistem secara atomik (_Database Transaction_) akan:
  1. Mengubah status Transaction menjadi `verified`.
  2. Mengubah status Invoice terkait menjadi `paid`.
  3. Mengubah status Booking terkait menjadi `confirmed`.

---

## 🛠️ Phase 3: Maintenances (Complaints) & Reviews

Sistem kini mendukung manajemen komplain tenant dan ulasan kamar.

### 1. Maintenances (Tenant Complaints)

Sistem untuk tenant melaporkan masalah atau kerusakan fasilitas kamar.

- **Pembuatan Laporan (Tenant):**
  - **Endpoint:** `POST /maintenances` (multipart/form-data)
  - Tenant dapat mengunggah hingga 5 foto kerusakan beserta kategori (plumbing, electrical, furniture, internet, other) dan deskripsi.
- **Daftar Laporan dengan Filter Lanjutan:**
  - **Endpoint:** `GET /maintenances`
  - **Filter yang didukung:**
    - `search` (string): Mencari berdasarkan nomor kamar, ID maintenance, nama tenant, ID tenant, atau deskripsi.
    - `status` (string): Filter berdasarkan status komplain (`open`, `in_progress`, `resolved`, `closed`).
    - `category` (string): Filter berdasarkan kategori kerusakan.
    - `startDate` & `endDate` (string/ISO): Filter berdasarkan rentang tanggal pelaporan.
  - **Contoh Penggunaan:**
    `GET /maintenances?status=open&category=plumbing&search=kamar bocor&startDate=2024-01-01&endDate=2024-01-31`
- **Update Status (Admin):**
  - **Endpoint:** `PATCH /maintenances/:id/status`
  - Admin dapat memperbarui status laporan (misal dari `open` menjadi `in_progress`) dan menambahkan `adminNotes` (catatan teknisi).

### 2. Reviews & Ratings

Sistem untuk tenant memberikan ulasan dan penilaian terhadap kamar setelah selesai menyewa.

- **Pembuatan Ulasan (Tenant):**
  - **Endpoint:** `POST /reviews`
  - **Validasi Ketat:**
    1. Tenant hanya dapat memberikan ulasan untuk booking miliknya sendiri.
    2. Tenant **hanya** dapat memberikan ulasan jika status booking sudah `completed` (selesai masa sewa).
    3. Satu booking hanya dapat diulas maksimal satu kali.
  - **Payload:** `{ "bookingId": "uuid", "rating": 5, "comment": "Bagus" }`
- **Daftar Ulasan:**
  - **Endpoint:** `GET /reviews`
  - **Filter yang didukung:** `roomId`, `tenantId`.
  - **Contoh Penggunaan:**
    `GET /reviews?roomId=uuid-kamar-123&page=1&perPage=5`

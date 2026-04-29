# Emerald House (RevoU CRACK Project) - Backend API

Booking Management System for Boarding House (Kos-kosan).

## Pagination & Filtering Documentation

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
*Note: Beberapa endpoint (seperti Rooms) mungkin mengembalikan properti `meta` tambahan seperti `totalRooms`, `totalAvailable`, dll.*

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

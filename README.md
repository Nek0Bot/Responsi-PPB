# API Peminjaman Buku

REST API untuk mengelola data peminjaman buku oleh anggota perpustakaan. Proyek ini dibuat menggunakan Node.js, Express.js, dan Supabase sebagai database, serta di-deploy menggunakan Vercel agar dapat diakses melalui internet.

## Tujuan Proyek

Proyek ini bertujuan untuk menerapkan konsep REST API dalam pengelolaan data peminjaman buku. API menyediakan operasi CRUD (*Create, Read, Update, Delete*) dan fitur filter berdasarkan status peminjaman.

## Teknologi yang Digunakan

- **Node.js** — lingkungan untuk menjalankan JavaScript di sisi server.
- **Express.js** — framework untuk membuat server dan endpoint REST API.
- **Supabase** — layanan database PostgreSQL untuk menyimpan data peminjaman.
- **Vercel** — platform deployment agar API dapat diakses secara publik.
- **GitHub** — tempat penyimpanan kode sumber dan dokumentasi proyek.

## Link Proyek

- **GitHub Repository:** https://github.com/Nek0Bot/Responsi-PPB
- **Vercel Deployment:** https://responsi-ppb-klsi-4pzy390r0r-bwfls.vercel.app

> Catatan: Pastikan alamat Vercel di atas sesuai dengan domain produksi yang aktif pada dashboard Vercel. Sebaiknya gunakan domain produksi tetap, bukan URL deployment yang memiliki identitas unik.

## Struktur Data

API menggunakan tabel `public.loans` pada Supabase dengan struktur berikut.

| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id` | BIGINT | Primary key dan ID peminjaman |
| `member_name` | TEXT | Nama anggota yang meminjam |
| `book_title` | TEXT | Judul buku yang dipinjam |
| `loan_date` | DATE | Tanggal peminjaman |
| `due_date` | DATE | Batas pengembalian |
| `return_date` | DATE | Tanggal pengembalian, boleh kosong |
| `status` | TEXT | Status peminjaman |
| `created_at` | TIMESTAMPTZ | Waktu data dibuat |

Status peminjaman yang digunakan adalah `Dipinjam`, `Dikembalikan`, dan `Terlambat`.

## Daftar Endpoint

| Method | Endpoint | Fungsi |
|---|---|---|
| GET | `/` | Menampilkan informasi API |
| GET | `/loans` | Mengambil seluruh data peminjaman |
| GET | `/loans/:id` | Mengambil data berdasarkan ID |
| POST | `/loans` | Menambahkan data peminjaman |
| PUT | `/loans/:id` | Memperbarui data peminjaman |
| DELETE | `/loans/:id` | Menghapus data peminjaman |

### 1. Menampilkan Seluruh Peminjaman

**Request**

```http
GET /loans
```

**Contoh response**

```json
{
  "message": "Data peminjaman berhasil diambil.",
  "total": 0,
  "data": []
}
```

Respons tersebut merupakan contoh ketika belum ada data peminjaman di database.

### 2. Filter Berdasarkan Status

**Request**

```http
GET /loans?status=Terlambat
```

Endpoint ini digunakan untuk menampilkan data peminjaman yang memiliki status `Terlambat`.

Contoh response jika terdapat satu data yang cocok:

```json
{
  "message": "Data peminjaman berhasil diambil.",
  "total": 1,
  "data": [
    {
      "id": 2,
      "member_name": "Siti Rahmawati",
      "book_title": "Basis Data",
      "loan_date": "2026-10-01",
      "due_date": "2026-10-08",
      "return_date": null,
      "status": "Terlambat"
    }
  ]
}
```

### 3. Menambahkan Peminjaman

**Request**

```http
POST /loans
Content-Type: application/json
```

**Request body**

```json
{
  "member_name": "Andi Saputra",
  "book_title": "Pemrograman Dasar",
  "loan_date": "2026-10-08",
  "due_date": "2026-10-15",
  "status": "Dipinjam"
}
```

Data dikirim dalam format JSON. Jika berhasil, API akan mengembalikan data peminjaman yang telah dibuat beserta ID-nya.

### 4. Mengambil Peminjaman Berdasarkan ID

**Request**

```http
GET /loans/1
```

Endpoint ini digunakan untuk mendapatkan detail satu peminjaman berdasarkan ID.

### 5. Memperbarui Peminjaman

**Request**

```http
PUT /loans/1
Content-Type: application/json
```

**Request body**

```json
{
  "status": "Dikembalikan",
  "return_date": "2026-10-12"
}
```

Endpoint ini digunakan untuk memperbarui informasi peminjaman berdasarkan ID. Field yang wajib dikirim mengikuti validasi yang diterapkan pada kode API.

### 6. Menghapus Peminjaman

**Request**

```http
DELETE /loans/1
```

Endpoint ini digunakan untuk menghapus data peminjaman berdasarkan ID.

> Contoh request dan response pada dokumentasi ini perlu dicocokkan dengan implementasi aktual sebelum digunakan sebagai bukti pengujian.

## Instalasi dan Menjalankan Secara Lokal

### Prasyarat

Pastikan perangkat sudah memiliki:

- Node.js dan npm.
- Akun Supabase.
- Git (jika ingin mengunduh proyek melalui GitHub).

### 1. Clone Repository

```bash
git clone https://github.com/Nek0Bot/Responsi-PPB.git
cd Responsi-PPB
```

### 2. Instal Dependensi

Pada Windows PowerShell, jika perintah `npm` bermasalah, gunakan `npm.cmd`.

```powershell
npm.cmd install
```

Jika dependensi belum tercatat di `package.json`, instal sesuai kebutuhan proyek:

```powershell
npm.cmd install express @supabase/supabase-js dotenv
npm.cmd install --save-dev nodemon
```

### 3. Konfigurasi Environment Variables

Buat file `.env` di direktori utama proyek:

```env
PORT=3000
SUPABASE_URL=https://PROJECT_ID.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Ganti nilai contoh dengan URL proyek dan publishable key milik sendiri dari Supabase.

Jangan mengunggah file `.env` ke GitHub.

### 4. Jalankan Server

Jika script `dev` sudah tersedia di `package.json`:

```powershell
npm.cmd run dev
```

Jika menggunakan script `start`:

```powershell
npm.cmd start
```

Server lokal akan berjalan pada port 3000 jika konfigurasi menggunakan nilai `PORT=3000`.

### 5. Uji Endpoint

Gunakan browser untuk menguji endpoint GET atau Postman untuk menguji seluruh operasi CRUD.

Contoh URL lokal:

```text
http://localhost:3000/
http://localhost:3000/loans
http://localhost:3000/loans?status=Terlambat
```

## Deployment

API di-deploy menggunakan Vercel. Variabel lingkungan berikut perlu dikonfigurasi pada pengaturan proyek Vercel:

- `SUPABASE_URL`
- `SUPABASE_KEY`

Nama variabel harus sesuai dengan yang dibaca oleh kode backend. Setelah mengubah variabel lingkungan, lakukan redeploy agar konfigurasi diterapkan.

## Keamanan

- File `.env` tidak boleh diunggah ke repositori publik.
- Gunakan publishable key dengan kebijakan Row Level Security (RLS) yang sesuai.
- Jangan menempatkan secret key atau service role key pada kode yang dapat diakses publik.
- Batasi akses data sesuai kebutuhan aplikasi.

## Pengujian

Pengujian API dapat dilakukan menggunakan Postman dengan memeriksa:

1. `GET /loans` untuk membaca data.
2. `GET /loans/:id` untuk membaca data berdasarkan ID.
3. `POST /loans` untuk menambahkan data.
4. `PUT /loans/:id` untuk memperbarui data.
5. `DELETE /loans/:id` untuk menghapus data.
6. `GET /loans?status=Terlambat` untuk menguji filter status.

Setiap endpoint perlu diuji untuk memastikan respons dan perubahan database sesuai dengan yang diharapkan.

## Kesimpulan

API Peminjaman Buku merupakan implementasi REST API menggunakan Node.js dan Express.js dengan Supabase sebagai database serta Vercel sebagai platform deployment. API dirancang untuk mendukung pengelolaan data peminjaman buku melalui operasi CRUD dan filter berdasarkan status.

## Deployment Vercel
https://responsi-ppb-klsi-5njsgnucm-bwlfsl.vercel.app

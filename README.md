# analyzer : Sistem Pemrosesan SOR

## Gambaran Umum

Aplikasi ini dirancang untuk mempermudah pemrosesan file **SOR (Smart Optical Reflectometer)** melalui pipeline yang melibatkan RabbitMQ sebagai message queue, MongoDB untuk manajemen dokumen, dan AWS S3 untuk penyimpanan file. Sistem ini memproses dokumen secara real-time menggunakan skrip Python untuk parsing dan pengolahan data.

### Fitur Utama
- **Polling MongoDB**: Memantau MongoDB secara terus-menerus untuk dokumen baru dengan `status: true`.
- **Pengunduhan File**: Mengunduh file dari AWS S3 untuk diproses.
- **Parsing SOR**: Memproses file SOR untuk mengekstrak data optik penting.
- **Message Queue**: Menggunakan RabbitMQ untuk antrian data hasil parsing.
- **Integrasi Python**: Menggunakan Python untuk parsing file SOR.
- **Error Handling**: Penanganan error yang tangguh untuk menangani masalah file atau koneksi.

---

## Arsitektur Sistem

### Komponen
1. **Inisialisasi Server**:
   - Menginisialisasi RabbitMQ dan memulai polling MongoDB.
   
2. **Producer**:
   - Menghubungkan ke RabbitMQ.
   - Mengirim pesan ke antrian `sor_parsed`.

3. **Monitor**:
   - Melakukan polling MongoDB untuk dokumen dengan `status: true`.
   - Memproses dokumen dan memperbarui statusnya.

4. **Helper**:
   - Menangani pengunduhan file dari AWS S3.
   - Parsing file SOR menggunakan skrip Python.
   - Menghapus file sementara setelah diproses.

5. **Consumer**:
   - Mengkonsumsi pesan dari antrian RabbitMQ untuk tindakan lebih lanjut.

---

## Persyaratan

### Perangkat Lunak
- **Node.js** v14+
- **Python** 3.7+
- **MongoDB** v4+
- **RabbitMQ**

### Variabel Lingkungan
Aplikasi ini bergantung pada variabel lingkungan berikut:

| Variabel          | Deskripsi                               |
|-------------------|------------------------------------------|
| `MONGODB_URI`     | URI koneksi MongoDB                     |
| `MONGODB_DB_NAME` | Nama database MongoDB                   |
| `RMQ_HOST`        | Host RabbitMQ                           |
| `RMQ_USERNAME`    | Username RabbitMQ                       |
| `RMQ_PASSWORD`    | Password RabbitMQ                       |
| `RMQ_VHOST`       | Virtual host RabbitMQ                   |
| `S3_ACCESS_KEY`   | Akses Key     S3                        |
| `S3_SECRET_KEY`   | Secret Key     S3                       |
| `S3_BUCKET_NAME`  | Nama bucket     S3                      |
| `S3_REGION`       | Region S3                               |
| `S3_ENDPOINT`     | Endpoint S3                             |

---

## Instalasi

1. Clone repositori:
   ```bash
   git clone https://github.com/Saepulloh07/analyzer.git
   cd analyzer
   ```

2. Install dependensi:
   ```bash
   npm install
   ```

3. Atur variabel lingkungan di file `.env`:
   ```dotenv
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
   MONGODB_DB_NAME=your_database
   RMQ_HOST=your-rabbitmq-host
   RMQ_USERNAME=your-username
   RMQ_PASSWORD=your-password
   RMQ_VHOST=your-vhost
   S3_ACCESS_KEY=your-access-key
   S3_SECRET_KEY=your-secret-key
   S3_BUCKET_NAME=your-bucket
   S3_REGION=your-region
   S3_ENDPOINT=your-endpoint
   ```

4. Jalankan aplikasi:
   ```bash
   node server.js
   ```

---

## Penggunaan

1. **Memulai Server**:
   - Aplikasi akan memulai dengan inisialisasi RabbitMQ dan polling MongoDB.

2. **Pemrosesan Dokumen**:
   - Dokumen di MongoDB dengan `status: true` akan diunduh dan diproses.
   - Hasil akan dikirim ke antrian `sor_parsed` di RabbitMQ.
   - Hasil pembacaan file sor disimpan di MongoDB pada collection `analyzer`

3. **Mengonsumsi Pesan**:
   - Gunakan modul `CONSUMER.JS` untuk memproses pesan yang ada di antrian.

---

## Pengembangan

### Struktur Folder
```
.
├── server.js       # Entry point utama
   ├── src
   ├── producer.js     # Logika producer RabbitMQ
   ├── monitor.js      # Logika polling MongoDB
   ├── helper.js       # Logika pengunduhan dan parsing file
   ├── consumer.js     # Logika consumer RabbitMQ
   ├── parse_sor.py    # Skrip Python untuk parsing SOR
└── .env.example    # Template variabel lingkungan
```

### Pengujian
- Lakukan unit test pada modul-modul penting menggunakan framework pengujian pilihan Anda.
- Validasi parsing file SOR dengan dataset sampel.

---

## Kontribusi

1. Fork repositori ini.
2. Buat branch fitur:
   ```bash
   git checkout -b fitur/fitur-anda
   ```
3. Commit perubahan Anda:
   ```bash
   git commit -m "Tambahkan fitur baru"
   ```
4. Push branch tersebut:
   ```bash
   git push origin fitur/fitur-anda
   ```
5. Buka pull request.

---

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

## Kontak

Untuk pertanyaan atau dukungan, silakan hubungi **saepulloh0711@gmail.com**.

# Tabel Pengujian BlackBox Testing

Berikut adalah hasil pengujian fungsional sistem e-ticketing yang terintegrasi dengan virtual tour 360° menggunakan metode BlackBox Testing. Pengujian mencakup fitur pengguna publik, fitur manajemen tour oleh admin, dashboard monitoring, dan aplikasi pemindai tiket (Scanner).

| No | Fitur yang Diuji | Skenario Pengujian | Input | Output yang Diharapkan | Hasil |
|:--:|:-----------------|:-------------------|:------|:-----------------------|:-----:|
| 1 | Akses Beranda | Pengguna membuka URL aplikasi | Akses URL beranda | Halaman beranda tampil (navbar, tombol Pesan Tiket, dll.) | Sesuai |
| 2 | Navigasi Menu | Pengguna klik menu (Beranda/Jelajah D’LAS/Wahana/Hubungi Kami) | Klik item menu | Berpindah ke halaman sesuai menu | Sesuai |
| 3 | Masuk (Login) - Valid | Pengguna login dengan kredensial benar | Email valid, password valid | Login berhasil dan user masuk ke sistem | Sesuai |
| 4 | Masuk (Login) - Invalid | Pengguna login dengan password salah | Email valid, password salah | Muncul pesan gagal login, tetap di halaman login | Sesuai |
| 5 | Masuk (Login) - Field kosong | Pengguna submit form login tanpa mengisi field wajib | Email kosong / password kosong | Validasi muncul, form tidak diproses | Sesuai |
| 6 | Daftar (Register) | Pengguna klik “Daftar” dari navbar | Klik tombol Daftar | Berpindah ke halaman pendaftaran | Sesuai |
| 7 | Akses Virtual Tour | Pengguna membuka fitur Jelajah D’LAS (virtual tour) | Klik menu Jelajah D’LAS, Floating Button 360, atau akses URL /virtual-tour | Halaman virtual tour terbuka dan scene pertama tampil | Sesuai |
| 8 | Hotspot Informasi | Pengguna klik hotspot info | Klik hotspot info | Informasi/penjelasan area tampil sesuai hotspot | Sesuai |
| 9 | Hotspot Navigasi | Pengguna klik hotspot navigate untuk pindah scene | Klik hotspot navigate | Scene berpindah ke tujuan, tampilan panorama berubah | Sesuai |
| 10 | Hotspot Loket - Tampil tiket | Pengguna klik hotspot loket pada scene loket | Klik hotspot loket | Muncul kartu/overlay tiket (nama tiket, harga, tombol Add) | Sesuai |
| 11 | Hotspot Loket - Add tiket | Pengguna menekan tombol “+ Add” pada tiket | Klik + Add | Tiket masuk ke keranjang, indikator item bertambah | Sesuai |
| 12 | Keranjang Belanja - Buka | Pengguna membuka keranjang dari icon/cart | Klik ikon keranjang | Drawer/panel keranjang tampil berisi item | Sesuai |
| 13 | Keranjang - Ubah kuantitas | Pengguna menambah/mengurangi jumlah tiket di keranjang | Klik + / - | Kuantitas berubah, total pembayaran ter-update | Sesuai |
| 14 | Keranjang - Hapus item | Pengguna menghapus item tiket dari keranjang | Klik ikon hapus | Item terhapus, total berubah, status keranjang sesuai | Sesuai |
| 15 | Keranjang - Lanjut Belanja | Pengguna klik “Lanjut Belanja” | Klik tombol Lanjut Belanja | Panel keranjang tertutup, user kembali ke virtual tour/halaman sebelumnya | Sesuai |
| 16 | Keranjang - Checkout Sekarang | Pengguna klik “Checkout Sekarang” | Klik tombol Checkout Sekarang | Berpindah ke halaman Checkout Pesanan | Sesuai |
| 17 | Checkout - Tampil ringkasan | Pengguna membuka halaman checkout | Akses halaman checkout | Ringkasan pesanan tampil (item, subtotal, total) | Sesuai |
| 18 | Checkout - Gunakan Data Profil | Pengguna klik tombol “Gunakan” pada “Gunakan Data Profil” | Klik Gunakan | Field nama/email/WA terisi otomatis sesuai profil user | Sesuai |
| 19 | Checkout - Validasi field wajib | Pengguna submit checkout dengan field wajib kosong | Nama/email/WA kosong | Muncul validasi, proses pembayaran tidak lanjut | Sesuai |
| 20 | Checkout - Catatan opsional | Pengguna mengisi catatan tambahan | Isi catatan | Catatan tersimpan dan ikut pada data pesanan | Sesuai |
| 21 | Checkout - Bayar Sekarang | Pengguna klik “Bayar Sekarang” | Klik Bayar Sekarang | Popup/halaman pembayaran invoice tampil | Sesuai |
| 22 | Pembayaran - Instruksi VA | Pengguna memilih metode pembayaran (mis. BCA VA) | Pilih BCA VA | Nomor VA & instruksi bayar tampil | Sesuai |
| 23 | Pembayaran - Status sukses | Pengguna menyelesaikan pembayaran (simulasi) | Aksi pembayaran sukses | Status pembayaran sukses tampil dan pesanan berstatus berhasil | Sesuai |
| 24 | Pasca bayar - Tiket Terbentuk | Setelah sukses bayar, sistem membuat order dan tiket | Sukses bayar | Order ID tercatat, tiket/QR tersedia pada akun/riwayat | Sesuai |
| 25 | Akses Virtual Tour dg Keranjang | Pengguna kembali ke virtual tour saat keranjang ada item | Add item lalu kembali | Virtual tour tetap berjalan, keranjang tetap menyimpan item | Sesuai |
| 26 | Konsistensi harga tiket | Harga tiket pada hotspot loket sama dengan harga di keranjang | Add tiket | Harga konsisten pada seluruh tampilan | Sesuai |
| 27 | Customer - Tiket Saya | Pengguna membuka menu "Tiket Saya" | Klik menu Tiket Saya | Daftar tiket aktif ditampilkan dengan status dan QR Code | Sesuai |
| 28 | Customer - Detail Tiket | Pengguna melihat detail salah satu tiket | Klik tombol Detail/Unduh | Informasi detail tiket (tanggal berlaku, list wahana) tampil | Sesuai |
| 29 | Customer - Riwayat Transaksi | Pengguna membuka menu "Transaksi Saya" | Klik menu Transaksi Saya | Daftar semua riwayat pembelian ditampilkan (Lunas/Pending/Gagal) | Sesuai |
| 30 | Customer - Filter Transaksi | Pengguna berpindah halaman riwayat transaksi (Pagination) | Klik halaman 2 | Daftar transaksi halaman selanjutnya ditampilkan | Sesuai |
| 31 | Logout | Pengguna melakukan logout | Klik logout | Session berakhir, kembali ke kondisi non-login | Sesuai |
| 32 | Admin - Dashboard Stats | Admin melihat ringkasan performa pada dashboard | Akses /admin/dashboard, tab Overview | KPI Card (Pendapatan, Tiket Terjual, dll) dan Grafik aktivitas tampil | Sesuai |
| 33 | Admin - Manajemen Tiket | Admin mencari tiket berdasarkan kode/email | Input kata kunci pada kolom pencarian | Tabel menampilkan data tiket yang sesuai dengan kata kunci | Sesuai |
| 34 | Admin - Filter Status Tiket | Admin memfilter tiket berdasarkan status (mis. Active) | Pilih status 'Aktif' pada dropdown filter | Hanya tiket dengan status Active yang ditampilkan di tabel | Sesuai |
| 35 | Admin - Detail Tiket & User | Admin melihat detail tiket dari tabel | Klik tombol aksi lalu 'Lihat Detail' | Modal tampil berisi info QR, data pembeli, dan riwayat status | Sesuai |
| 36 | Admin - Tambah Scene | Admin menambah scene baru | Klik "Tambah Scene", isi form (Nama, Urutan, Upload Gambar), Simpan | Scene baru tersimpan dan muncul dalam daftar dengan status Aktif | Sesuai |
| 37 | Admin - Tambah Hotspot Info | Admin menambahkan hotspot info pada scene | Buka detail scene, klik "Tambah Hotspot", tipe=Info, isi pitch/yaw manual | Hotspot tipe Info tersimpan dan muncul pada list hotspot scene | Sesuai |
| 38 | Admin - Tambah Hotspot Navigate | Admin menambahkan hotspot navigate ke scene tujuan | Pilih tipe=Navigasi, pilih Target Scene, isi pitch/yaw, simpan | Hotspot navigasi terbentuk dan mengarah ke scene tujuan | Sesuai |
| 39 | Admin - Tambah Hotspot Loket | Admin menambahkan hotspot loket terkait tiket | Pilih tipe=Loket, pilih Produk Terkait, isi pitch/yaw, simpan | Hotspot loket menampilkan kartu produk/tiket saat diakses | Sesuai |
| 40 | Admin - Edit/Hapus Hotspot | Admin mengubah atau menghapus hotspot | Klik edit pada list hotspot atau hapus | Perubahan data hotspot tersimpan atau data terhapus dari list | Sesuai |
| 41 | Admin - Mode Debug | Admin mengaktifkan mode debug untuk bantuan pengembangan | Masuk menu Pengaturan, aktifkan toggle "Mode Debug" | Mode debug aktif (log koordinat/visual helper) pada viewer virtual tour | Sesuai |
| 42 | Scanner - Login Petugas | Petugas Scanner login melalui halaman login utama | Email/Pass role Scanner di /auth/login | Berhasil login dan otomatis diarahkan ke halaman /scanner | Sesuai |
| 43 | Scanner - Scan QR Valid | Petugas memindai QR Code tiket yang valid | Scan QR Valid | Sistem menampilkan status "Tiket Valid" dan rincian item | Sesuai |
| 44 | Scanner - Scan QR Tidak Valid | Petugas memindai QR Code yang salah/tidak dikenal | Scan QR Invalid | Sistem menampilkan pesan error "Tiket tidak ditemukan" | Sesuai |
| 45 | Scanner - Redeem Tiket | Petugas menukarkan (redeem) kuota tiket pengunjung | Input jumlah + Klik Tukar | Status tiket terupdate (berkurang/habis) dan tercatat di sistem | Sesuai |
| 46 | Scanner - Cek Status Kedaluwarsa | Petugas memindai tiket yang sudah lewat tanggal | Scan QR Expired | Sistem menolak validasi dengan pesan "Tiket Kedaluwarsa" | Sesuai |

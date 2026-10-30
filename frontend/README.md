# MutaTrack — Frontend Web Application

Aplikasi antarmuka web modern untuk platform bioinformatika MutaTrack. Dibangun dengan **React 19**, **TypeScript**, **Vite**, dan **Tailwind CSS v4**.

---

## Struktur Direktori Frontend

```
frontend/
├── src/                # Kode sumber TypeScript + React (Komponen UI, Layanan, Tipe)
│   ├── components/     # Landing page, Dashboard, VariantTable, LogTerminal, Form
│   ├── services/       # PipelineRunner, ExportService (VCF/CSV/PDF), LocalStorage
│   ├── types/          # Definisi interface TypeScript & schema data
│   ├── App.tsx         # Root container & router view
│   ├── index.css       # Tailwind CSS styling & font setup
│   └── main.tsx        # React DOM entry point
├── public/             # Aset statis (DNA Helix 3D, icon, favicon)
├── package.json        # Dependensi npm & skrip frontend
└── README.md           # Dokumentasi frontend
```

---

## Cara Menjalankan Frontend Standalone

1. Masuk ke direktori:
```bash
npm install
```

2. Jalankan server pengembangan Vite:
```bash
npm run dev
```

Aplikasi web akan berjalan pada port `3000`: `http://localhost:3000`.

---

## Fitur-Fitur Utama Frontend
1. **Hero Section Interaktif**: Lengkap dengan visual kristal DNA helix 3D dan kartu *Live Pipeline Telemetry*.
2. **Form Analisis Baru**: Validasi berkas FASTQ R1/R2 & referensi FASTA, penyetelan parameter pipeline.
3. **Preset Contoh *E. coli***: Muat contoh analisis 1-klik dengan data riil varian mutasi genetik (*gyrA*, *rpoB*, *katG*, dll).
4. **Tabel Eksplorasi Varian**: Filter dampak SnpEff (HIGH, MODERATE, LOW), tipe mutasi (SNP/INDEL), pencarian instan, dan paginasi.
5. **Terminal Eksekusi Bash Live**: Memantau output log tiap langkah dengan auto-scroll.
6. **Ekspor Terstandarisasi**: Unduh berkas **VCF v4.2**, **CSV**, **Laporan PDF**, dan log eksekusi.

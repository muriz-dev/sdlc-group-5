# CONTEXT.md

Konteks teknis proyek **Student Academic Work Coordination** — aplikasi demo untuk latihan SDLC (kelompok 5).

## Ringkasan

Aplikasi web client-side untuk menampilkan daftar tugas akademik contoh, melihat detail, dan menandai progres. Tidak ada backend, autentikasi, database, maupun sinkronisasi antar-perangkat. Semua perubahan hanya tersimpan di `localStorage` browser.

Tujuan utamanya adalah menyediakan basis kode kecil dan deterministik untuk latihan alur kerja tim: milestone → task → branch → focused commit → pull request → peer review → merge (lihat README bagian *Collaboration Notes*).

## Tech Stack

| Area | Pilihan |
| --- | --- |
| UI | React 19.3.0 (function components + hooks) |
| Build/dev server | Vite 8.3.4 |
| Bahasa | JavaScript (ESM, `"type": "module"`), tanpa TypeScript |
| Styling | CSS biasa di `src/styles.css` (tanpa framework/preprocessor) |
| State | `useState` + `useEffect` lokal di `App.jsx`, tanpa state library |
| Persistensi | `window.localStorage`, key `sdlc:case-c:v1` |
| Test/Lint | Belum ada konfigurasi test, lint, atau formatter |

## Perintah

```bash
npm install     # instalasi dependency
npm run dev     # jalankan dev server Vite
npm run build   # build produksi ke dist/
npm run preview # pratinjau hasil build
```

## Struktur Proyek

```
index.html                  # entry HTML, mount #root
src/main.jsx                # bootstrap React (StrictMode) + import styles.css
src/App.jsx                 # owner state: data, selectedId, handler utama
src/components/
  TaskList.jsx              # daftar tugas + empty state
  TaskCard.jsx              # kartu tugas (tombol seleksi, aria-pressed)
  TaskDetails.jsx           # panel detail + tombol aksi status sesuai status saat ini
  StatusBadge.jsx           # badge status + pemetaan warna (tone)
  ResetControl.jsx          # reset data dengan konfirmasi dua langkah
src/data/seed.js            # 6 record demo deterministik + createSeedData()
src/utils/taskUtils.js      # sortTasksByDueDate(), getTaskCounts(), advanceTaskStatus()
src/utils/storage.js        # loadState(), saveState(), resetState() + validasi shape
src/styles.css              # seluruh styling, termasuk media query responsif
```

## Model Data

Bentuk state global: `{ tasks: Task[] }`.

```js
{
  id: 'TASK-001',                 // string unik, format TASK-XXX
  title: 'Submit group outline',
  course: 'Software Engineering',
  dueDate: '2026-10-20',          // string ISO (YYYY-MM-DD), bukan Date object
  source: 'LMS',                  // LMS | Personal Notes | Class Announcement
  type: 'GROUP',                  // GROUP | INDIVIDUAL
  status: 'TODO'                  // TODO | IN_PROGRESS | DONE
}
```

`createSeedData()` selalu mengembalikan salinan baru (shallow copy per task), sehingga data seed asli tidak termutasi.

## Alur State & Persistensi

1. Inisialisasi: `useState(() => loadState(STORAGE_KEY, createSeedData))`.
2. `loadState` membaca `localStorage`, `JSON.parse`, lalu memvalidasi bentuk data dengan `matchesShape` terhadap hasil seed. Data yang tidak cocok atau gagal di-parse akan diabaikan dan fallback ke seed.
3. Setiap perubahan `data` disimpan lewat `useEffect` → `saveState` (try/catch, mengembalikan boolean, tidak melempar error).
4. `handleAdvanceStatus(taskId)` memetakan ulang tasks; status bergerak satu langkah: `TODO → IN_PROGRESS → DONE → TODO` (langkah terakhir adalah "Reopen Task"). Label tombol di `TaskDetails` mengikuti status: `Start Task`, `Mark as Done`, `Reopen Task`.
5. `handleReset()` memanggil `resetState` (hapus key + seed baru), lalu mereset `selectedId` ke tugas dengan deadline terdekat.
6. `selectedId` disimpan di state terpisah dan bisa menjadi `null` (mis. daftar kosong) — `TaskDetails` menangani kondisi ini lewat empty state.
7. Daftar tugas selalu ditampilkan terurut naik berdasarkan `dueDate` (`sortTasksByDueDate`, perbandingan string ISO). Sorting hanya untuk tampilan: `data.tasks` di state tetap memakai urutan aslinya, dan pilihan awal (`selectedId`) mengikuti item pertama hasil sorting.

Catatan: alur "Reopen Task" mengubah status `DONE` → `TODO`, bukan mengembalikan status sebelumnya (`IN_PROGRESS`).

## Konvensi Kode

- Component function biasa dengan `export default`, file `.jsx`, satu komponen per file.
- Props diteruskan eksplisit; tanpa Context, tanpa prop-drilling abstractions, tanpa library UI.
- Nama handler di `App.jsx` memakai prefix `handle*` (`handleToggleCompletion`, `handleReset`).
- Utility murni (tanpa side effect React) berada di `src/utils/`; fungsi transformasi mengembalikan array baru, tidak memutasi input.
- Status ditampilkan sebagai teks uppercase dan garis bawah diganti spasi (`IN_PROGRESS` → `IN PROGRESS`); tone warna dipetakan di `StatusBadge.jsx` (`success`, `info`, `warning`, `neutral`).
- Styling memakai class name deskriptif (`app-shell`, `record-card`, `panel`) dan design token warna langsung di CSS (`#2563eb` sebagai warna primer).
- Aksesibilitas: tombol asli (bukan `div` clickable), `aria-pressed` pada kartu terpilih, `aria-label` pada section/list, `:focus-visible` outline.
- Komentar hanya dipakai untuk menjelaskan alasan non-obvious (contoh di `resetState`), bukan menjelaskan kode.

## Batasan yang Disengaja

- Data tidak pernah dikirim ke server dan tidak dibagikan antar-browser/perangkat.
- Tidak ada validasi tanggal, filtering, pencarian, atau pembuatan tugas baru. Satu-satunya pengurutan adalah `dueDate` menaik (deadline terdekat lebih dulu).
- `loadState` hanya memeriksa kesamaan tipe/shape, bukan validitas nilai domain (mis. `status` di luar enum tetap lolos).
- Tidak ada test otomatis; verifikasi dilakukan manual lewat `npm run dev` atau `npm run build`.

## Perubahan yang Perlu Diperhatikan

- Mengubah bentuk objek task berarti memperbarui seed **dan** mempertimbangkan migrasi `localStorage`; data lama akan gagal `matchesShape` dan otomatis fallback ke seed (perubahan pengguna hilang).
- Mengubah `STORAGE_KEY` berdampak langsung ke data tersimpan pengguna.
- Bundle produksi berada di `dist/` dan tidak di-commit.

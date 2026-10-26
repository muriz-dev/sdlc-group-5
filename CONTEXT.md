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
src/App.jsx                 # owner state: data, selectedId, showCompleted, handler utama
src/components/
  TaskList.jsx              # daftar tugas + empty state (pesan bisa dikustom)
  TaskCard.jsx              # kartu tugas (tombol seleksi, aria-pressed) + penanda update
  TaskDetails.jsx           # panel detail + tombol aksi status sesuai status saat ini
  StatusBadge.jsx           # badge status + pemetaan warna (tone)
  ResetControl.jsx          # reset data dengan konfirmasi dua langkah
src/data/seed.js            # 6 record demo deterministik + createSeedData()
src/utils/taskUtils.js      # sorting, active/overdue detection, visibility, counts, and status transitions
src/utils/dateUtils.js      # formatDeadlineDate(), formatDeadline() (tanggal + jam 24 jam)
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
  dueTime: '23:59',               // string 'HH:MM' 24 jam (tanpa AM/PM), mis. 00:00 vs 12:00
  previousDueDate: '',            // deadline sebelum diubah; '' jika belum pernah berubah
  previousDueTime: '',            // jam deadline sebelumnya; '' jika belum pernah berubah
  deadlineUpdatedAt: '',          // tanggal perubahan deadline (YYYY-MM-DD); '' jika tidak ada
  instructionsUpdatedAt: '',      // tanggal perubahan instruksi (YYYY-MM-DD); '' jika tidak ada
  source: 'LMS',                  // LMS | Personal Notes | Class Announcement
  type: 'GROUP',                  // GROUP | INDIVIDUAL
  status: 'TODO',                 // TODO | IN_PROGRESS | DONE
  description: '...'              // string, deskripsi detail penugasan akademik
}
```

`createSeedData()` selalu mengembalikan salinan baru (shallow copy per task), sehingga data seed asli tidak termutasi.

## Alur State & Persistensi

1. Inisialisasi: `useState(() => loadState(STORAGE_KEY, createSeedData))`.
2. `loadState` membaca `localStorage`, `JSON.parse`, lalu memvalidasi bentuk data dengan `matchesShape` terhadap hasil seed. Data yang tidak cocok atau gagal di-parse akan diabaikan dan fallback ke seed.
3. Setiap perubahan `data` disimpan lewat `useEffect` → `saveState` (try/catch, mengembalikan boolean, tidak melempar error).
4. `handleAdvanceStatus(taskId)` memetakan ulang tasks; status bergerak satu langkah: `TODO → IN_PROGRESS → DONE → TODO` (langkah terakhir adalah "Reopen Task"). Label tombol di `TaskDetails` mengikuti status: `Start Task`, `Mark as Done`, `Reopen Task`.
5. `handleReset()` memanggil `resetState` (hapus key + seed baru), lalu mereset `selectedId` ke item pertama daftar yang sedang terlihat (menghormati `showCompleted`).
6. `selectedId` disimpan di state terpisah dan bisa menjadi `null` (mis. daftar kosong) — `TaskDetails` menangani kondisi ini lewat empty state.
7. Daftar adalah **tampilan gabungan lintas mata kuliah**: `getVisibleTasks(tasks, showCompleted)` mengurutkan seluruh `data.tasks` berdasarkan deadline (`dueDate` lalu `dueTime`) lalu menyaring task aktif (`status !== 'DONE'`) kecuali `showCompleted` aktif. Sorting hanya untuk tampilan: `data.tasks` di state tetap memakai urutan aslinya.
8. Deadline ditampilkan lewat `dateUtils`: kartu memakai `formatDeadline` (`20 Oct 2026 · 23:59`), panel detail memisahkan `Due date` dan `Due time` dengan label `(24-hour)`. Format 24 jam dipilih agar `00:00` (tengah malam) dan `12:00` (siang) tidak ambigu.
9. `TaskDetails` menampilkan notice perubahan bila `deadlineUpdatedAt` atau `instructionsUpdatedAt` tidak kosong: badge `Updated`, entri `Deadline changed` (deadline baru + deadline sebelumnya + tanggal perubahan), entri `Instructions updated`, dan marker `Changed` di samping `Due date`. `previousDueDate`/`previousDueTime` hanya dibaca saat `deadlineUpdatedAt` ada. Field penanda memakai string kosong (bukan `null`) agar `matchesShape` tetap konsisten dengan task lain yang tidak berubah.
10. `TaskCard` menampilkan penanda ringkas di daftar: `Deadline updated` bila `deadlineUpdatedAt` ada, selain itu `Instructions updated` bila `instructionsUpdatedAt` ada. Tujuannya agar pengguna bisa melihat task yang berubah tanpa membuka detail satu per satu.
11. `showCompleted` (default `false`) dikendalikan checkbox `Show completed (n)` di header daftar. Ringkasan `N active assignments from M courses · nearest deadline first` dihitung dari daftar yang terlihat. Saat toggle dimatikan dan task terpilih berstatus `DONE`, `selectedId` pindah ke task aktif pertama (atau `null`). Saat task terpilih berubah menjadi `DONE` dengan completed disembunyikan, selection juga pindah ke task aktif berikutnya. Empty state memakai pesan berbeda: `No active assignments...` vs `No academic tasks are available.`
12. Change Injection P11 diterapkan melalui `isOverdueTask()`: task berstatus selain `DONE` dianggap terlambat bila waktu lokal saat ini sudah melewati gabungan `dueDate` dan `dueTime`. Task terlambat tetap termasuk dalam daftar aktif, diberi badge `OVERDUE` pada kartu dan panel detail, serta dihitung pada kartu ringkasan. Waktu pembanding diperbarui setiap menit agar label berubah tanpa reload halaman.

Catatan: alur "Reopen Task" mengubah status `DONE` → `TODO`, bukan mengembalikan status sebelumnya (`IN_PROGRESS`).

## Konvensi Kode

- Component function biasa dengan `export default`, file `.jsx`, satu komponen per file.
- Props diteruskan eksplisit; tanpa Context, tanpa prop-drilling abstractions, tanpa library UI.
- Nama handler di `App.jsx` memakai prefix `handle*` (`handleAdvanceStatus`, `handleToggleCompleted`, `handleReset`).
- Utility murni (tanpa side effect React) berada di `src/utils/`; fungsi transformasi mengembalikan array baru, tidak memutasi input.
- Status ditampilkan sebagai teks uppercase dan garis bawah diganti spasi (`IN_PROGRESS` → `IN PROGRESS`); tone warna dipetakan di `StatusBadge.jsx` (`success`, `info`, `warning`, `neutral`).
- Styling memakai class name deskriptif (`app-shell`, `record-card`, `panel`) dan design token warna langsung di CSS (`#2563eb` sebagai warna primer).
- Aksesibilitas: tombol asli (bukan `div` clickable), `aria-pressed` pada kartu terpilih, `aria-label` pada section/list, `:focus-visible` outline.
- Komentar hanya dipakai untuk menjelaskan alasan non-obvious (contoh di `resetState`), bukan menjelaskan kode.

## Batasan yang Disengaja

- Data tidak pernah dikirim ke server dan tidak dibagikan antar-browser/perangkat.
- Tidak ada validasi tanggal/jam, pencarian, atau pembuatan tugas baru. Filter yang ada hanya `Show completed` (menyembunyikan task `DONE`), dan satu-satunya pengurutan adalah deadline menaik (`dueDate` lalu `dueTime`).
- Tidak ada peran dosen, enrollment, maupun UI untuk mengubah deadline/instruksi: metadata perubahan berasal dari seed dan hanya ditampilkan. Karena data lokal per-browser, semua pengguna demo melihat perubahan yang sama saat data seed dimuat. "Mata kuliah yang diikuti" diwakili oleh seluruh `course` yang ada di `data.tasks`.
- `loadState` hanya memeriksa kesamaan tipe/shape, bukan validitas nilai domain (mis. `status` di luar enum tetap lolos).
- Tidak ada test otomatis; verifikasi dilakukan manual lewat `npm run dev` atau `npm run build`.

## Perubahan yang Perlu Diperhatikan

- Mengubah bentuk objek task berarti memperbarui seed **dan** mempertimbangkan migrasi `localStorage`; data lama akan gagal `matchesShape` dan otomatis fallback ke seed (perubahan pengguna hilang).
- Mengubah `STORAGE_KEY` berdampak langsung ke data tersimpan pengguna.
- Bundle produksi berada di `dist/` dan tidak di-commit.

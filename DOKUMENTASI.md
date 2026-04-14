# Dokumentasi Project: Angular Essentials — Starting Project

## Daftar Isi

1. [Gambaran Umum](#gambaran-umum)
2. [Struktur Project](#struktur-project)
3. [Konsep Angular yang Digunakan](#konsep-angular-yang-digunakan)
4. [Penjelasan File per File](#penjelasan-file-per-file)
5. [Alur Data (Data Flow)](#alur-data-data-flow)
6. [Komunikasi Antar Component](#komunikasi-antar-component)
7. [Konsep Penting untuk Dipelajari](#konsep-penting-untuk-dipelajari)
8. [Cara Menjalankan Project](#cara-menjalankan-project)

---

## Gambaran Umum

Project ini adalah **Angular 18 starter project** dengan nama `essentials`. Ini adalah aplikasi sederhana bernama **"Easy Task"** — sebuah simulasi aplikasi task management yang menampilkan daftar user secara acak setiap kali aplikasi dimuat ulang.

**Tech Stack:**
- Angular 18 (Standalone Components)
- TypeScript 5.4
- RxJS 7.8

---

## Struktur Project

```
01-starting-project/
├── src/
│   └── app/
│       ├── app.component.ts        ← Root component
│       ├── app.component.html      ← Template root
│       ├── app.component.css       ← Style root
│       ├── dummy-users.ts          ← Data statis user
│       ├── header/
│       │   ├── header.component.ts
│       │   ├── header.component.html
│       │   └── header.component.css
│       └── user/
│           ├── user.component.ts
│           ├── user.component.html
│           └── user.component.css
├── angular.json                    ← Konfigurasi Angular CLI
├── package.json                    ← Dependensi project
└── tsconfig.json                   ← Konfigurasi TypeScript
```

---

## Konsep Angular yang Digunakan

### 1. Standalone Components

Di Angular 18, setiap component bisa berdiri sendiri (tidak butuh `NgModule`). Ciri-cirinya ada `standalone: true` di decorator `@Component`.

```typescript
@Component({
  selector: 'app-root',
  standalone: true,           // ← Ini yang membuat component "mandiri"
  imports: [HeaderComponent, UserComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {}
```

> **Kenapa standalone?** Sejak Angular 14+, standalone components menggantikan NgModule untuk proyek baru. Lebih simpel dan tidak perlu daftarkan component ke modul.

---

### 2. Component Decorator (`@Component`)

Setiap class Angular component wajib punya decorator `@Component` dengan minimal properti berikut:

| Properti | Fungsi |
|---|---|
| `selector` | Nama tag HTML yang dipakai di template, misal `<app-root>` |
| `standalone` | `true` = tidak butuh NgModule |
| `imports` | Daftar component/directive/pipe yang dipakai di template |
| `templateUrl` | Path ke file HTML template |
| `styleUrl` / `styleUrls` | Path ke file CSS |

---

### 3. String Interpolation `{{ }}`

Menampilkan nilai dari property component ke dalam template HTML.

```html
<!-- user.component.html -->
<span>{{ selectedUser.name }}</span>
```

`selectedUser.name` dibaca dari property `selectedUser` di class `UserComponent`.

---

### 4. Property Binding `[ ]`

Mengikat nilai TypeScript ke atribut HTML secara dinamis.

```html
<!-- user.component.html -->
<img [src]="imagePath" [alt]="selectedUser.name">
```

- `[src]="imagePath"` → nilai `src` diambil dari getter `imagePath` di class component
- `[alt]="selectedUser.name"` → nilai `alt` diambil dari property `selectedUser.name`
- Berbeda dengan `src="{{ ... }}"` biasa, property binding lebih efisien untuk nilai dinamis

> **Perbedaan `{{ }}` vs `[ ]`:**
> - `{{ }}` = untuk konten teks di dalam tag HTML
> - `[ ]` = untuk nilai atribut HTML

---

### 4a. Getter (`get`) sebagai Computed Property

TypeScript mendukung **getter** — sebuah method yang dipanggil seperti property biasa (tanpa tanda kurung `()`).

```typescript
// user.component.ts (pendekatan lama — sebelum pakai Signal)
get imagePath() {
  return 'assets/users/' + this.selectedUser.avatar;
}
```

**Cara pakainya di template:**
```html
<!-- bukan imagePath() — tanpa kurung, diperlakukan seperti property -->
<img [src]="imagePath">
```

**Kenapa pakai getter, bukan langsung di template?**

| Pendekatan | Contoh | Keterangan |
|---|---|---|
| Langsung di template | `[src]="'assets/users/' + selectedUser.avatar"` | Logika string ada di HTML — susah dibaca jika panjang |
| Getter di class | `[src]="imagePath"` | Template bersih, logika terpusat di TypeScript |

> **Aturan praktis:** Jika ekspresi di template mulai terasa panjang atau kompleks, pindahkan ke getter atau method di class component. Template idealnya hanya berisi **apa yang ditampilkan**, bukan **bagaimana menghitungnya**.
>
> Di project ini, getter `imagePath` sudah **digantikan oleh `computed()`** (Signal API). Lihat konsep 7 dan 8 di bawah.

---

### 5. Data Statis (Constant / Array)

File `dummy-users.ts` menyimpan data dalam bentuk konstanta TypeScript yang di-export:

```typescript
export const DUMMY_USERS = [
  { id: 'u1', name: 'Jasmine Washington', avatar: 'user-1.jpg' },
  // ...
];
```

Kemudian di-import ke component:

```typescript
import { DUMMY_USERS } from '../dummy-users';
```

---

### 7. Signal — Reactive State di Angular 17+

**Signal** adalah cara modern Angular untuk menyimpan state yang **reaktif** — artinya ketika nilainya berubah, Angular secara otomatis tahu bagian template mana yang perlu di-render ulang.

**Import:**
```typescript
import { signal, computed } from '@angular/core';
```

---

#### Membuat Signal

```typescript
// user.component.ts
selectedUser = signal(DUMMY_USERS[randomIndex]);
//             ^^^^^^ membungkus nilai awal dengan signal()
```

`signal(nilaiAwal)` membuat sebuah **Signal object** yang menyimpan nilai dan bisa dilacak perubahannya oleh Angular.

---

#### Membaca Nilai Signal

Di TypeScript (class), baca signal dengan **memanggil seperti function** — pakai tanda kurung `()`:

```typescript
// di dalam class
this.selectedUser()        // membaca nilai saat ini
this.selectedUser().name   // akses property dari nilai signal
this.selectedUser().avatar
```

Di template HTML, sama — pakai tanda kurung `()`:

```html
{{ selectedUser().name }}
[alt]="selectedUser().name"
```

> **Jangan lupa `()`** saat membaca signal. Tanpa kurung, yang kamu dapat bukan nilainya tapi **object Signal itu sendiri**.

---

#### Mengubah Nilai Signal — `.set()`

```typescript
onSelectUser() {
  const randomIndex = Math.floor(Math.random() * DUMMY_USERS.length);
  this.selectedUser.set(DUMMY_USERS[randomIndex]);
  //                ^^^ mengganti nilai signal dengan nilai baru
}
```

`.set(nilaiBaru)` mengganti nilai signal secara penuh. Angular langsung mendeteksi perubahan ini dan memperbarui tampilan.

> **Perbandingan dengan property biasa:**
> ```typescript
> // Property biasa — Angular tidak otomatis tahu berubah
> this.selectedUser = DUMMY_USERS[randomIndex];
>
> // Signal — Angular langsung tahu dan update template
> this.selectedUser.set(DUMMY_USERS[randomIndex]);
> ```

---

#### Ringkasan API Signal

| Method | Kegunaan | Contoh |
|---|---|---|
| `signal(val)` | Membuat signal baru | `signal(DUMMY_USERS[0])` |
| `signal()` | Membaca nilai signal | `this.selectedUser()` |
| `.set(val)` | Mengganti nilai signal | `this.selectedUser.set(user)` |
| `.update(fn)` | Mengubah berdasarkan nilai sebelumnya | `this.count.update(n => n + 1)` |

---

### 8. `computed()` — Signal Turunan

`computed()` membuat signal yang nilainya **dihitung otomatis** dari signal lain. Jika signal sumbernya berubah, `computed` ikut diperbarui.

```typescript
// user.component.ts
imagePath = computed(() => 'assets/users/' + this.selectedUser().avatar);
//          ^^^^^^^^ fungsi arrow yang membaca signal lain di dalamnya
```

**Cara pakainya di template — sama seperti signal biasa, pakai `()`:**

```html
<img [src]="imagePath()">
```

**Perbandingan `computed()` vs getter `get`:**

| | `get imagePath()` | `computed(() => ...)` |
|---|---|---|
| Cara baca di template | `imagePath` (tanpa kurung) | `imagePath()` (dengan kurung) |
| Reaktivitas | Dihitung ulang **setiap render** | Hanya dihitung ulang jika signal sumber berubah |
| Cocok untuk | Kalkulasi sederhana, non-signal | Kalkulasi berbasis signal (lebih efisien) |

> **Kapan pakai `computed` vs `get`?**
> Jika nilainya bergantung pada **signal**, gunakan `computed()` karena Angular bisa melacak dependensinya secara efisien. Jika tidak ada signal yang terlibat, `get` masih valid.

---

### 9. Event Binding `( )`

Event binding menghubungkan event DOM (seperti klik) ke method di class component.

```html
<!-- user.component.html -->
<button (click)="handleClick()">
```

- `(click)` — nama event DOM yang didengarkan (dalam kurung)
- `"handleClick()"` — method yang dipanggil saat event terjadi

Event binding umum lainnya: `(input)`, `(change)`, `(submit)`, `(keyup)`, dsb.

---

### 10. `@Input()` — Menerima Data dari Parent

`@Input()` memungkinkan parent component mengirim data ke child component melalui atribut di template.

```typescript
// user.component.ts
@Input({ required: true }) id!: string;
@Input({ required: true }) avatar!: string;
@Input({ required: true }) name!: string;
```

- `required: true` — Angular akan error saat build jika parent tidak mengisi properti ini
- `!` (non-null assertion) — memberitahu TypeScript bahwa nilai pasti akan ada saat runtime

**Cara parent mengirim data (property binding):**
```html
<!-- app.component.html -->
<app-user
  [id]="users[0].id"
  [avatar]="users[0].avatar"
  [name]="users[0].name"
/>
```

> **Aturan:** Nama dalam `[ ]` di template parent harus cocok persis dengan nama `@Input()` di class child.

---

### 11. `@Output()` + `EventEmitter` — Mengirim Event ke Parent

`@Output()` memungkinkan child component mengirim event ke parent. Pasangannya adalah `EventEmitter`.

```typescript
// user.component.ts
@Output() selectUser = new EventEmitter<string>();
//         ^^^^^^^^^                     ^^^^^^
//         nama event                    tipe nilai yang dikirim
```

**Cara mengirim (emit) nilai:**
```typescript
handleClick() {
  this.selectUser.emit(this.id);  // kirim this.id ke parent
}
```

**Cara parent mendengarkan:**
```html
<!-- app.component.html -->
(selectUser)="onSelectUser($event)"
// ^^^^^^^^^                ^^^^^^
// nama @Output di child    nilai yang dikirim via .emit()
```

> **Aturan:** Nama dalam `( )` di template parent harus cocok persis dengan nama `@Output()` di class child.

---

### 12. `$event` — Nilai yang Dikirim Bersama Event

`$event` adalah kata kunci khusus Angular di template yang berisi nilai dari event yang terjadi.

Untuk event DOM biasa, `$event` berisi object event bawaan browser:
```html
<input (input)="onType($event)" />
<!-- $event = InputEvent (object browser) -->
```

Untuk `@Output()` + `EventEmitter`, `$event` berisi nilai yang di-`.emit()`:
```html
(selectUser)="onSelectUser($event)"
<!-- $event = nilai dari this.selectUser.emit(this.id) = string id user -->
```

**Alur `$event` secara lengkap:**
```
UserComponent:  this.selectUser.emit("u1")
                                     ↓
AppComponent:   (selectUser)="onSelectUser($event)"
                                            ↓ $event = "u1"
AppComponent:   onSelectUser(userId: string) { ... }
                              userId = "u1"
```

---

### 6. Logika di Luar Class (Module-level)

```typescript
// user.component.ts
const randomIndex = Math.floor(Math.random() * DUMMY_USERS.length);

export class UserComponent {
  selectedUser = DUMMY_USERS[randomIndex];
}
```

`randomIndex` dihitung **satu kali saat modul dimuat**, bukan setiap kali component dibuat ulang. Ini pola yang perlu dipahami — jika ingin acak setiap kali component di-render, pindahkan logika ke dalam constructor atau `ngOnInit`.

---

## Penjelasan File per File

### `app.component.ts` — Root Component

```typescript
import { Component } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { UserComponent } from './user/user.component';
import { DUMMY_USERS } from './dummy-users';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, UserComponent],  // component anak wajib didaftarkan di sini
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  users = DUMMY_USERS;  // data user dikirim ke child via @Input()

  // Dipanggil saat menerima event (selectUser) dari UserComponent.
  // userId adalah nilai $event — string id yang di-emit oleh child.
  onSelectUser(userId: string) {
    console.log('Selected user ID:', userId);
  }
}
```

**Yang perlu diperhatikan:**
- `users` menyimpan data yang akan dikirim ke setiap `<app-user>` via `@Input()`
- `onSelectUser()` adalah **event handler** — dipanggil ketika child emit event `selectUser`
- Child components (`HeaderComponent`, `UserComponent`) **harus didaftarkan di `imports`** agar bisa dipakai di template

---

### `app.component.html` — Template Root

```html
<app-header></app-header>
<main>
  <ul id="users">
    <li>
      <app-user
        [id]="users[0].id"
        [avatar]="users[0].avatar"
        [name]="users[0].name"
        (selectUser)="onSelectUser($event)"
      />
    </li>
    <!-- ...user lainnya -->
  </ul>
</main>
```

- `[id]`, `[avatar]`, `[name]` — property binding, mengirim data ke `@Input()` di `UserComponent`
- `(selectUser)` — event binding, mendengarkan `@Output() selectUser` dari `UserComponent`
- `$event` — nilai yang dikirim via `.emit()`, yaitu id user bertipe `string`

---

### `header/header.component.ts` — Header Component

```typescript
@Component({
  selector: "app-header",
  standalone: true,
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],    // ← perhatikan: styleUrls (plural, array)
})
export class HeaderComponent {}
```

Component ini **stateless** — tidak punya data atau logic, hanya menampilkan logo dan judul aplikasi.

---

### `header/header.component.html` — Template Header

```html
<header>
    <img src="assets/task-management-logo.png" alt="Task Management logo" />
    <div>
        <h1>Easy Task</h1>
        <p>Enterprise-level task management</p>
    </div>
</header>
```

Path `assets/...` merujuk ke folder `src/assets/` yang di-serve langsung oleh Angular CLI.

---

### `user/user.component.ts` — User Component

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css'
})
export class UserComponent {
  // @Input — menerima data dari parent (AppComponent)
  @Input({ required: true }) id!: string;
  @Input({ required: true }) avatar!: string;
  @Input({ required: true }) name!: string;

  // @Output — mendefinisikan event yang bisa didengar parent
  // EventEmitter<string> = event ini mengirim nilai bertipe string
  @Output() selectUser = new EventEmitter<string>();

  get imagePath() {
    return `assets/users/${this.avatar}`;
  }

  // Dipanggil saat tombol diklik (lihat template: (click)="handleClick()")
  // .emit() mengirim this.id ke parent sebagai $event
  handleClick() {
    this.selectUser.emit(this.id);
  }
}
```

**Alur komunikasi:**
1. Parent mengirim `id`, `avatar`, `name` via `@Input()`
2. User klik tombol → `handleClick()` dipanggil
3. `selectUser.emit(this.id)` → event dikirim ke parent
4. Parent menerima `$event` (berisi `id`) dan menjalankan `onSelectUser(userId)`

---

### `user/user.component.html` — Template User

```html
<div>
    <!-- (click) = click event binding. Saat tombol diklik, Angular memanggil handleClick(). -->
    <button (click)="handleClick()">
        <img [src]="imagePath" [alt]="name">
        <span>{{ name }}</span>
    </button>
</div>
```

| Ekspresi | Jenis | Penjelasan |
|---|---|---|
| `(click)="handleClick()"` | Event binding | Memanggil method saat tombol diklik |
| `[src]="imagePath"` | Property binding | Membaca getter `imagePath` |
| `[alt]="name"` | Property binding | Membaca `@Input() name` |
| `{{ name }}` | String interpolation | Menampilkan nama user di dalam `<span>` |

---

### `dummy-users.ts` — Data Statis

```typescript
export const DUMMY_USERS = [
  { id: 'u1', name: 'Jasmine Washington', avatar: 'user-1.jpg' },
  { id: 'u2', name: 'Emily Thompson',     avatar: 'user-2.jpg' },
  { id: 'u3', name: 'Marcus Johnson',     avatar: 'user-3.jpg' },
  { id: 'u4', name: 'David Miller',       avatar: 'user-4.jpg' },
  { id: 'u5', name: 'Priya Patel',        avatar: 'user-5.jpg' },
  { id: 'u6', name: 'Arjun Singh',        avatar: 'user-6.jpg' },
];
```

File ini bukan component — hanya file TypeScript biasa yang meng-export konstanta. Pattern ini umum dipakai untuk mock data sebelum ada backend.

---

## Alur Data (Data Flow)

```
dummy-users.ts
     │
     │  DUMMY_USERS (array of objects)
     ▼
user.component.ts
     │
     ├─ signal(DUMMY_USERS[randomIndex])  →  selectedUser (Signal)
     │                                           │
     │                                           │ computed() membaca selectedUser()
     │                                           ▼
     │                                       imagePath (Computed Signal)
     │
     │  [klik tombol]
     │      ↓
     │  onSelectUser() → selectedUser.set(...)
     │      ↓
     │  Angular mendeteksi perubahan signal
     │      ↓
     │  imagePath dihitung ulang otomatis
     ▼
user.component.html
     │
     │  {{ selectedUser().name }}
     │  [src]="imagePath()"
     ▼
Browser (HTML diperbarui secara reaktif)
```

Data mengalir **satu arah**: TypeScript → Template → Browser. Dengan Signal, Angular hanya memperbarui bagian yang benar-benar bergantung pada signal yang berubah — lebih efisien dari sebelumnya.

---

## Komunikasi Antar Component

Angular menggunakan pola **satu arah** untuk komunikasi antar component:

```
Parent (AppComponent)
    │
    │  @Input() — kirim data ke bawah (property binding)
    │  [id], [avatar], [name]
    ▼
Child (UserComponent)
    │
    │  @Output() + EventEmitter — kirim event ke atas (event binding)
    │  (selectUser)="onSelectUser($event)"
    ▼
Parent (AppComponent)
```

### Ringkasan Pola

| Arah | Mekanisme | Di Child | Di Template Parent |
|---|---|---|---|
| Parent → Child | `@Input()` | `@Input() name!: string` | `[name]="users[0].name"` |
| Child → Parent | `@Output()` + `EventEmitter` | `@Output() selectUser = new EventEmitter<string>()` | `(selectUser)="onSelectUser($event)"` |

### Kenapa `$event`?

Saat child memanggil `.emit(nilai)`, Angular menangkap nilai itu dan menyimpannya sebagai `$event` di template parent. Nama `$event` adalah **kata kunci khusus Angular** — tidak bisa diganti nama lain di template.

```
child:  this.selectUser.emit("u1")
                              ↓
parent: (selectUser)="onSelectUser($event)"
                                    ↓
                           userId = "u1"
```

---

## Konsep Penting untuk Dipelajari

Berdasarkan project ini, berikut topik yang bisa kamu eksplorasi lebih lanjut:

### Sudah ada di project ini:
- [x] Standalone Components
- [x] String Interpolation `{{ }}`
- [x] Property Binding `[attr]`
- [x] Event Binding `(event)` — termasuk `(click)`
- [x] `@Input()` — menerima data dari parent component
- [x] `@Output()` + `EventEmitter` — mengirim event ke parent component
- [x] `$event` — nilai yang dikirim bersama event
- [x] Signal — reactive state dengan `signal()`
- [x] Computed Signal — nilai turunan dengan `computed()`
- [x] Getter (`get`) sebagai computed property
- [x] Component Composition (component di dalam component)
- [x] Import data dari file TypeScript biasa

### Langkah selanjutnya (belum ada, bisa dicoba):
- [ ] **ngFor** — tampilkan semua user dari `DUMMY_USERS` dengan loop
- [ ] **ngIf / @if** — tampilkan/sembunyikan elemen berdasarkan kondisi
- [ ] **Service & Dependency Injection** — berbagi data antar component
- [ ] **Two-way binding** — `[(ngModel)]` untuk form input

---

## Cara Menjalankan Project

```bash
# Install dependensi (hanya pertama kali)
npm install

# Jalankan development server
npm start
# atau
ng serve

# Buka browser ke:
# http://localhost:4200
```

Server akan auto-reload setiap kali ada perubahan file.

---

> **Catatan:** Setiap kali halaman di-refresh, user yang tampil akan berubah secara acak karena `randomIndex` dihitung ulang saat modul JavaScript dimuat kembali oleh browser.



## Muammo

Admin panelda (`/admin`) faqat video URL qo'shish/tahrirlash mavjud. Darslik matni (content) tahrirlash imkoniyati yo'q.

## Reja

### 1. Admin panelga darslik matni tahrirlash qo'shish (`src/pages/Admin.tsx`)

Har bir dars kartasiga video URL bilan birga **content (darslik matni)** tahrirlash imkoniyatini qo'shish:

- Har bir dars kartasida "Matnni tahrirlash" tugmasi qo'shiladi
- Bosilganda textarea ochiladi (darslik matni uchun)
- Saqlash tugmasi bilan databasega yoziladi (`lessons.content` ustuniga UPDATE)

Mavjud `updateVideoUrl` mutation ga o'xshash `updateContent` mutation qo'shiladi.

### 2. Admin panelga kirish yo'li

Siz `/admin` sahifaga brauzer address bar orqali yoki Profil sahifasidan kirishingiz mumkin. Profil sahifasiga admin bo'lsangiz "Admin Panel" tugmasi qo'shiladi.

### O'zgartiriladigan fayllar
- `src/pages/Admin.tsx` — content tahrirlash funksiyasi
- `src/pages/Profile.tsx` — admin panel havolasi (agar hali yo'q bo'lsa)


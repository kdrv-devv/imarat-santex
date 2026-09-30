# Imarat-log

Santexnika guruhi uchun obyektlar (uylar) va ularga kerakli ashyolar ro'yxatini yuritish ilovasi.

**Stack:** Next.js 16 (App Router, Server Actions), React 19, Tailwind CSS v4, MongoDB (Mongoose), JWT (jose) + httpOnly cookie.

## Ishga tushirish

```bash
cp .env.example .env.local   # kerak bo'lsa qiymatlarni o'zgartiring
npm install
npm run dev
```

`.env.local`:

| O'zgaruvchi | Tavsif |
|---|---|
| `MONGODB_URI` | MongoDB ulanish manzili |
| `JWT_SECRET` | Sessiya tokenini imzolash kaliti (productionda albatta o'zgartiring) |
| `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` | Bazada foydalanuvchi bo'lmasa, birinchi kirishda shu ma'lumotlar bilan SUPERADMIN yaratiladi |

## Rollar

- **SUPERADMIN** — hodimlar yaratadi, ularning login/parolini o'zgartiradi, kim qaysi obyektni yaratgani va qaysi mahsulotni qo'shganini ko'radi (Faoliyat bo'limi).
- **Hodim** — obyekt yaratadi, mahsulot bazasini to'ldiradi, obyektga ashyo qo'shadi. Login/parolni o'zi o'zgartira olmaydi.

## Sahifalar

| Yo'l | Tavsif |
|---|---|
| `/login` | Kirish |
| `/objects` | Obyektlar ro'yxati |
| `/objects/[id]` | Obyekt ashyolari: qo'shish, miqdor, PNG yuklab olish, ulashish |
| `/products` | Mahsulotlar bazasi (rasm bilan) |
| `/profile` | Profil |
| `/admin/employees` | Hodimlar (faqat superadmin) |
| `/admin/activity` | Faoliyat jurnali (faqat superadmin) |
| `/share/[token]` | Ochiq, faqat ko'rish rejimidagi ro'yxat (kirish talab qilinmaydi) |

## Tuzilma

```
src/
  app/            sahifalar (App Router)
  components/     UI komponentlar
  lib/actions/    server actions (backend logikasi)
  lib/models/     Mongoose modellari: User, Product, Site, Activity
  lib/auth.ts     sessiya (JWT cookie)
  proxy.ts        route himoyasi
```

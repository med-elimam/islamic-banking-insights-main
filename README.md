# استبيان أكاديمي — تحول البنوك التقليدية إلى بنوك إسلامية في موريتانيا

استبيان أكاديمي حول تحول البنوك التقليدية إلى بنوك إسلامية في موريتانيا.
يجمع الاستجابات ويخزّنها في قاعدة بيانات Supabase، مع لوحة تحكم للمدير
تتضمن تحليلًا إحصائيًا ورسومًا بيانية وتصدير Excel/PDF + إدارة الأسئلة يدويًا (تعديل/إضافة/حذف).

## التقنيات

- TanStack Start (React 19) + Vite 7
- Tailwind CSS v4 — دعم RTL كامل
- Supabase (Postgres + Auth + RLS)
- Recharts للرسوم، XLSX و jsPDF للتصدير

## التشغيل المحلي

```bash
# مع bun (موصى به)
bun install
bun run dev

# أو مع npm
npm install
npm run dev
```

ثم افتح http://localhost:8080

## متغيرات البيئة (`.env`)

| المتغير                         | الوصف                                          | مطلوب     |
| ------------------------------- | ---------------------------------------------- | --------- |
| `VITE_SUPABASE_URL`             | رابط مشروع Supabase (https://xxx.supabase.co)  | ✅ كلاينت |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | المفتاح العام (anon/publishable key)           | ✅ كلاينت |
| `VITE_SUPABASE_PROJECT_ID`      | معرف المشروع                                   | اختياري   |
| `SUPABASE_URL`                  | نفس الرابط (للسيرفر/SSR)                       | ✅ سيرفر  |
| `SUPABASE_PUBLISHABLE_KEY`      | نفس المفتاح العام (للسيرفر)                    | ✅ سيرفر  |
| `SUPABASE_SERVICE_ROLE_KEY`     | المفتاح الخدمي (Server only — لا يُكشف للعميل) | ✅ سيرفر  |

> احصل عليها من: Supabase Dashboard → Project Settings → API.

## قاعدة البيانات

الجداول (موجودة في `supabase/migrations/`):

- `responses` — البيانات الديموغرافية + السؤال المفتوح
- `answers` — كل إجابة على عبارة ليكرت
- `survey_questions` — أسئلة الاستبيان (قابلة للتعديل من لوحة الإدارة)
- `user_roles` + نوع `app_role` + دالة `has_role` (آمنة من recursion)

RLS مفعّل:

- أي زائر يستطيع إرسال استجابة (insert فقط).
- يقرأ الإجابات/الاستجابات فقط من له دور `admin`.
- أي زائر يقرأ الأسئلة المفعّلة فقط؛ والإدارة فقط من له `admin`.

### إنشاء قاعدة بيانات جديدة (عند الاستضافة الخاصة)

1. أنشئ مشروع Supabase جديدًا.
2. شغّل ملفي الـ migration بالترتيب من `supabase/migrations/` عبر:
   - واجهة SQL Editor في Supabase، أو
   - `supabase db push` إذا تستعمل Supabase CLI.
3. أنشئ حساب المدير في Supabase Auth:
   انتقل إلى: **Authentication → Users → Add user**
   أدخل بريدًا وكلمة مرور قوية (لا تنشرهما أبدًا).
   فعّل البريد فورًا (Email Confirmed).
4. أعطه دور المدير — شغّل هذا الأمر من **SQL Editor** (استبدل البريد ببريدك الفعلي):

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'your-admin@email.com';
```

## إنشاء حساب المدير

يُنشأ حساب المدير يدويًا ولا تُخزَّن بياناته في الكود أو في أي ملف مرفوع على GitHub.

1. انتقل إلى: **Supabase → Authentication → Users → Add user**
2. أنشئ مستخدمًا ببريدك الخاص وكلمة مرور قوية.
3. بعد إنشاء المستخدم، شغّل هذا الأمر من **SQL Editor** (استبدل البريد ببريدك الفعلي):

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'
from auth.users
where email = 'your-admin@email.com';
```

## الصفحات

- `/` الرئيسية
- `/survey` الاستبيان
- `/thanks` صفحة الشكر
- `/auth` تسجيل دخول الباحث
- `/admin` لوحة التحكم (تبويبات: نظرة عامة · الاستجابات · إدارة الأسئلة)
- `/analysis` التحليل الإحصائي التفصيلي

## النشر — أفضل المنصات

### 1) Vercel (الأنسب لـ TanStack Start)

- اربط GitHub → استورد المستودع.
- أضف متغيرات البيئة أعلاه.
- Framework Preset: Vite — Build command: `bun run build` (أو `npm run build`)، Output: `.output/public`.

### 2) Railway (سهل وعملي)

- أنشئ مشروع جديد → Deploy from GitHub.
- أضف Service من النوع Node.
- Build: `npm install && npm run build`
- Start: `npm run start`
- Port: `process.env.PORT` (التطبيق يلتقطها تلقائيًا).
- أضف كل متغيرات البيئة في تبويب Variables.

### 3) Netlify

- Build: `npm run build` — Publish: `.output/public`.
- أضف نفس متغيرات البيئة.

### 4) Cloudflare Pages / Workers

- مدعوم لأن المشروع يستهدف Edge runtime افتراضيًا.

## النشر عبر Lovable

اضغط زر «Publish» داخل واجهة Lovable لنشر فوري.

## رفع المشروع على GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

لا تنسَ إضافة ملف `.env` إلى `.gitignore` (موجود بالفعل) لئلا تُرفع المفاتيح.

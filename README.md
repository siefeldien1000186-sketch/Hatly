# Hatly (هاتلي) - Egypt On-Demand Super App Platform
> **منصة النقل والتوصيل الموحدة (Uber + Talabat + Careem) في جمهورية مصر العربية 🇪🇬**

---

## 🌟 نظرة عامة على المشروع (Project Overview)

منصة **هاتلي (Hatly)** هي سوبر آب متكامل للنقل الذكي وتوصيل الطلبات، تم تصميمها وهندستها لتنافس أوبر وطلبات وكريم في السوق المصري، بالجنيه المصري (EGP) وبدعم كامل للغة العربية (RTL) والإنجليزية (LTR).

المنصة مبنية كنظام متصل (Connected Ecosystem) يربط ٤ أنظمة رئيسية متزامنة في الوقت الفعلي عبر تقنية WebSockets:
1. **تطبيق العميل (Customer Mobile Web App)**: حجز المشاوير، طلب المطاعم، الشحن السريع، السوبرماركت، والصيدليات مع تتبع حي ومحفظة إلكترونية.
2. **تطبيق الكابتن (Driver / Courier App)**: زر متصل/غير متصل، رادار لاستقبال الطلبات القريبة بالعداد التنازلي، محاكي حركة GPS لحظي، وأرباح وسحب رصيد فوري.
3. **لوحة تحكم المطعم والمتجر (Restaurant & Store Portal)**: استقبال طلبات المطبخ، تغيير حالة التحضير حتى جاهزية الاستلام، وإدارة المنيو وتوفر الأصناف.
4. **لوحة التحكم المركزية (Admin Command Center)**: خريطة مراقبة الحركة، اعتماد وتوثيق مستندات السائقين (KYC)، محرك التسعير الديناميكي (Surge/KM)، وإدارة أكواد الخصم.

---

## 🚀 خريطة الخدمات الخمس (Hatly 5 Core Services)

| الخدمة | الاسم | الوصف | نموذج التسعير |
|---|---|---|---|
| 🚗 **1. هاتلي رايد** | **Hatly Ride** | مشاوير ونقل ذكي (Go اقتصادي، Comfort، سكوتر موتو، وفان عائلي ٧ راكب) | فتح عداد + سعر الكيلومتر + سعر الدقيقة + معامل الذروة |
| 🍔 **2. هاتلي فود** | **Hatly Food** | طلب وتوصيل وجبات المطاعم (كشري أبو طارق، حواوشي، مشويات، حلويات) | سعر الوجبات + رسوم توصيل المطعم + رسوم خدمة |
| 📦 **3. هاتلي إكسبريس** | **Hatly Express** | توصيل فوري للطرود، المستندات والأغراض من الباب للباب | رسوم ثابتة أساسية + سعر الكيلومتر المقطوع |
| 🛒 **4. هاتلي ماركت** | **Hatly Market** | بقالة وسوبرماركت (ألبان، بيض، خضروات) تصل في ٣٠ دقيقة | أسعار المنتجات + رسوم توصيل ثابتة |
| 💊 **5. هاتلي شوبينج** | **Hatly Shopping** | صيدليات (العزبي) ومتاجر التجزئة ومستلزمات العناية | أسعار المنتجات + رسوم التوصيل السريع |

---

## 🛠️ التقنيات المستخدمة (Technology Stack)

### **الواجهة الخلفية (Backend & Database)**
- **بيئة التشغيل:** Node.js v24+ مع TypeScript
- **إطار العمل:** Express.js RESTful API Architecture
- **محرك البيانات:** Prisma ORM مع SQLite (للتطوير الفوري بدون إعداد) ومهيأ بنسبة 100% للتحويل لـ PostgreSQL في الإنتاج
- **الاتصال اللحظي:** Socket.IO v4.8 (تتبع مباشر، غرف المحادثة، رادار الطلبات)
- **الأمان والتحقق:** JWT (JSON Web Tokens)، تشفير كلمات المرور بـ BcryptJS، حماية الصلاحيات بحسب الدور (RBAC)

### **الواجهات الأمامية (Frontend Super App)**
- **إطار العمل:** React 18 مع Vite و TypeScript
- **التصميم والهوية:** Tailwind CSS مع نظام ألوان هاتلي الرسمي (`#FF6B00` برتقالي، `#151515` داكن، `#FFFFFF` ناصع)
- **الخرائط التفاعلية:** Leaflet و OpenStreetMap مع علامات مخصصة ومسارات وبوصلة كابتن متحركة
- **الأيقونات والخطوط:** Lucide React مع خط Cairo العربي الرسمي وخط Inter اللاتيني
- **تعدد اللغات:** Arabic (RTL) افتراضي + English (LTR) بزر تبديل واحد فوري

---

## 🔑 حسابات العرض التجريبية المدمجة (Demo Accounts)

تم تغذية قاعدة البيانات مسبقاً بحسابات مصرية حقيقية يمكنك التبديل بينها بضغطة زر واحدة من الشريط العلوي:

| الدور | الاسم | رقم الهاتف | كلمة المرور | الرصيد / السيارة |
|---|---|---|---|---|
| 🛡️ **مدير النظام** | مدير إدارة هاتلي | `01000000001` | `admin123` | لوحة التحكم الكاملة |
| 👤 **العميل** | أحمد مصطفى | `01011112222` | `hatly123` | محفظة ٧٥٠ ج.م |
| 🚗 **الكابتن (سيارة)** | محمود إبراهيم | `01022223333` | `hatly123` | هيونداي إلنترا ٢٠٢٣ |
| 🛵 **الكابتن (سكوتر)** | كريم يوسف | `01033334444` | `hatly123` | هوندا ديو ١١٠ سي سي |
| 🍽️ **المطعم** | كشري أبو طارق | `01055556666` | `hatly123` | وسط البلد، القاهرة |
| 🛒 **السوبرماركت** | هايبر وان | `01066667777` | `hatly123` | الشيخ زايد، الجيزة |

> **رمز التحقق التجريبي لأي رقم هاتف (OTP Sandbox):** `1234`  
> **كوبونات الخصم الفعالة للتجربة:** `HATLY20` (خصم 20%)، `WELCOME` (خصم 30%)

---

## 💻 طريقة التشغيل محلياً (Run Locally)

### 1. تشغيل السيرفر وقاعدة البيانات (Backend)
```bash
cd e:\hatly\backend

# تثبيت الحزم (إذا لزم)
npm install

# توليد Prisma Client وتحديث الجداول
npx prisma db push

# زرع البيانات التجريبية
npx tsx prisma/seed.ts

# تشغيل السيرفر على البورت 5000
npm run dev
```
- الرابط: `http://localhost:5000/api/v1`
- فحص الحالة: `http://localhost:5000/health`

### 2. تشغيل واجهة السوبر آب (Frontend)
```bash
cd e:\hatly\frontend

# تثبيت الحزم
npm install

# تشغيل خادم التطوير على البورت 3000
npm run dev
```
- الرابط في المتصفح: `http://localhost:3000/`

---

## 📡 وثائق الـ API الرئيسية (REST API Endpoints)

### **المصادقة والمستخدمين (Auth)**
- `POST /api/v1/auth/otp/request` - إرسال رمز تحقق OTP لرقم المحمول المصري
- `POST /api/v1/auth/otp/verify` - تأكيد الرمز وتسجيل الدخول
- `POST /api/v1/auth/login` - تسجيل الدخول بالهاتف وكلمة المرور
- `POST /api/v1/auth/register` - تسجيل حساب جديد (عميل، كابتن، مطعم)
- `GET /api/v1/auth/me` - جلب بيانات المستخدم الحالية

### **الطلبات والتسعير (Orders & Pricing)**
- `POST /api/v1/orders/estimate` - حساب تسعيرة المشوار بناءً على الإحداثيات وكود الخصم
- `POST /api/v1/orders` - إنشاء طلب جديد (رايد، فود، إكسبريس، ماركت، شوبينج)
- `GET /api/v1/orders/my` - سجل طلبات العميل
- `GET /api/v1/orders/:id` - تفاصيل طلب معين مع مساره والكابتن
- `POST /api/v1/orders/:id/cancel` - إلغاء الطلب ورد المبلغ للمحفظة

### **الكابتن (Driver)**
- `POST /api/v1/driver/toggle-online` - تبديل التواجد (متصل / غير متصل)
- `POST /api/v1/driver/location` - تحديث إحداثيات GPS للكابتن وبثها لحظياً
- `GET /api/v1/driver/radar` - جلب الطلبات المعلقة القريبة
- `POST /api/v1/driver/accept-order` - قبول الكابتن للطلب
- `POST /api/v1/driver/trip-status` - تحديث مسار الرحلة (`DRIVER_ARRIVED` ➔ `IN_PROGRESS` ➔ `COMPLETED`)
- `GET /api/v1/driver/stats` - إحصائيات الأرباح اليومية والتقييم والمحفظة
- `POST /api/v1/driver/withdraw` - طلب سحب أرباح الكابتن (انستاباي / كاش)

### **المطاعم والمتاجر (Stores)**
- `GET /api/v1/stores` - قائمة المتاجر والمطاعم المفتوحة
- `GET /api/v1/stores/:id` - قائمة المطعم وتفاصيل الأصناف
- `GET /api/v1/store/my` - لوحة صاحب المتجر والطلبات الواردة
- `POST /api/v1/store/toggle-open` - فتح / إغلاق المتجر
- `POST /api/v1/store/product` - إضافة صنف جديد للمنيو
- `POST /api/v1/store/order-status` - تحديث حالة الطلب (`STORE_PREPARING` ➔ `STORE_READY`)

### **المحفظة والتقييمات (Wallet & Reviews)**
- `GET /api/v1/wallet` - رصيد المحفظة وسجل الحركات المالية
- `POST /api/v1/wallet/top-up` - شحن المحفظة (انستاباي، فودافون كاش، فوري، فيزا)
- `POST /api/v1/reviews` - تقييم الكابتن أو المطعم بالنجوم والتعليق

### **الإدارة المركزية (Admin Control)**
- `GET /api/v1/admin/analytics` - مؤشرات الإيرادات والمبيعات الكلية
- `GET /api/v1/admin/orders` - سجل كافة الطلبات والمشاوير الحية
- `GET /api/v1/admin/drivers` - قائمة الكباتن ومستنداتهم
- `PATCH /api/v1/admin/drivers/:id/verify` - اعتماد الكابتن أو رفضه
- `GET /api/v1/admin/pricing-rules` - استعراض قواعد التسعير
- `PUT /api/v1/admin/pricing-rules/:id` - تعديل فتح العداد وسعر الكيلومتر والعمولة
- `POST /api/v1/admin/promos` - إنشاء كود خصم جديد

---

## ⚡ أحداث الـ WebSockets اللحظية (Real-Time Events)

| الحدث (Event) | الاتجاه | الوصف |
|---|---|---|
| `join:order` | Client ➔ Server | انضمام العميل والكابتن لغرفة تتبع مشوار معين |
| `driver:location` | Driver ➔ Server | بث إحداثيات GPS الحية للكابتن أثناء القيادة |
| `driver:location:update` | Server ➔ Customer | تحديث حركة أيقونة السيارة على خريطة العميل |
| `radar:new_order` | Server ➔ Drivers | إشعار صوتي ومرئي للكباتن المتصلين بطلب جديد |
| `order:status_update` | Server ➔ All | إشعار فوري عند تغير حالة المشوار أو التوصيل |
| `order:chat:send` | Client ➔ Server | إرسال رسالة شات داخل التطبيق |
| `order:chat:message` | Server ➔ Client | استقبال رسائل المحادثة بين العميل والكابتن |

---

## 🚢 خطوات النشر للإنتاج (Production Deployment)

### 1. التحويل إلى PostgreSQL
في ملف `backend/prisma/schema.prisma`، قم بتغيير:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
وفي ملف `backend/.env` حدد رابط الاتصال بقاعدة البيانات الخاصة بك على Supabase أو AWS أو Neon:
```env
DATABASE_URL="postgresql://postgres:password@your-db-host:5432/hatly_prod?schema=public"
```

### 2. بوابات الدفع المصرية (Egyptian Payment Gateways)
الباك إند مهيأ في `src/services/pricing.service.ts` و `src/controllers/wallet.controller.ts` لربط:
- **Paymob:** عبر الـ iFrame / Card & Wallet API
- **Fawry:** عبر Fawry Pay Reference Code
- **Kashier / Telda / InstaPay Webhooks**

### 3. بوابات الرسائل القصيرة (SMS Providers)
في ملف `backend/src/services/otp.service.ts`، قم بتمرير الـ API Key الخاص بأي مزود مصري:
- **VictoryLink Egypt**
- **Infobip**
- **Twilio**

---

## 📄 الترخيص (License)
هذا المشروع مطور كملكية خاصة لشركة **Hatly Technologies Egypt** © 2026.
جميع الحقوق محفوظة.

# دليل النشر والربط بالدومين وتطبيقات الموبايل - منصة هاتلي (Hatly)
# Complete Production Deployment & Mobile App Guide

هذا الدليل يوضح بالخطوات العملية الشاملة كيفية ربط منصة **هاتلي (Hatly)** بالدومين الرسمي، وتفعيل شهادات الأمان SSL، وإعداد الـ Subdomains، بالإضافة لكيفية تصدير تطبيقات الموبايل الحقيقية للأندرويد (APK / AAB) والآيفون (iOS).

---

## ١. هيكل الدومين والـ Subdomains المقترح
| النطاق (Domain) | الاستخدام | المسار المستهدف |
|---|---|---|
| `www.hatly.com` / `hatly.com` | الموقع الرئيسي والواجهة التعريفية | واجهة الويب (Frontend Build) |
| `app.hatly.com` | تطبيق العميل للطلب والتتبع المباشر | تطبيق العميل للويب والموبايل PWA |
| `admin.hatly.com` | لوحة التحكم المركزية للإدارة | لوحة إدارة العمليات والتقارير |
| `api.hatly.com` | خادم الباكيند وقواعد البيانات وWebSockets | خادم Node.js / Express (Port 5000) |

---

## ٢. إعداد سجلات الـ DNS (لدى مزود الدومين مثل Namecheap, GoDaddy, Cloudflare)
قم بالدخول إلى لوحة تحكم الدومين وإضافة سجلات **A Records** التالية مشيرة إلى عنوان الـ IP الخاص بسيرفرك (VPS):

```text
Type    Name     Value (Target IP)       TTL
A       @        123.45.67.89 (سيرفرك)    Auto
A       www      123.45.67.89            Auto
A       app      123.45.67.89            Auto
A       admin    123.45.67.89            Auto
A       api      123.45.67.89            Auto
```

---

## ٣. خطوات الإعداد على السيرفر (Ubuntu 22.04 / 24.04 LTS)

### الخطوة ١: تحديث السيرفر وتثبيت المتطلبات
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx certbot python3-certbot-nginx

# تثبيت Node.js v20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### الخطوة ٢: تنزيل المشروع وتثبيت الاعتماديات
```bash
cd /var/www
git clone <your-hatly-repo-url> hatly
cd /var/www/hatly

# تجهيز الباكيند
cd backend
npm install
cp .env.production.example .env
# قم بتعديل مفاتيح الأمان في ملف .env
npx prisma generate
npx prisma db push

# تشغيل الباكيند عبر PM2
pm2 start src/server.ts --name "hatly-backend" --interpreter npx --interpreter-args tsx
pm2 save
pm2 startup

# تجهيز الفرونت إند
cd ../frontend
npm install
cp .env.production.example .env.production
npm run build
```

### الخطوة ٣: إعداد Nginx وتفعيل شهادة الـ SSL المجانية (Let's Encrypt)
```bash
# نسخ إعدادات Nginx
sudo cp /var/www/hatly/nginx/hatly.conf /etc/nginx/sites-available/hatly.conf
sudo ln -s /etc/nginx/sites-available/hatly.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# إصدار شهادات SSL المشفرة لجميع الدومينات بضغطة واحدة
sudo certbot --nginx -d hatly.com -d www.hatly.com -d app.hatly.com -d admin.hatly.com -d api.hatly.com
```

---

## ٤. تحويل المنصة إلى تطبيقات موبايل حقيقية (Android & iOS)

تطبيق **هاتلي** مبني بمعمارية تدعم العمل كتطبيق موبايل أصيل (Native App) باستخدام **Capacitor**:

### الخطوة ١: تجهيز Capacitor داخل مجلد الفرونت إند
```bash
cd e:\hatly\frontend

# تثبيت أدوات الموبايل
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npm install @capacitor/geolocation @capacitor/push-notifications @capacitor/camera

# تهيئة المشروع
npx cap init "Hatly" "com.hatly.superapp" --web-dir dist
```

### الخطوة ٢: بناء حزمة الأندرويد (Android Studio & APK/AAB)
```bash
# بناء كود الويب
npm run build

# إضافة منصة الأندرويد ومزامنتها
npx cap add android
npx cap sync android

# فتح المشروع داخل Android Studio
npx cap open android
```
- داخل **Android Studio**:
  1. اضغط على `Build` > `Generate Signed Bundle / APK`.
  2. اختر `Android App Bundle` للرفع على متجر Google Play، أو `APK` للتثبيت المباشر على الهواتف.

### الخطوة ٣: بناء حزمة الآيفون (iOS / Xcode)
```bash
# إضافة منصة iOS ومزامنتها
npx cap add ios
npx cap sync ios

# فتح المشروع في Xcode (يتطلب جهاز Mac)
npx cap open ios
```
- اضغط على زر `Archive` ثم قم برفع التطبيق إلى **Apple App Store Connect**.

---

## ٥. دعم الـ PWA الفوري (تثبيت بدون متاجر)
تم تزويد المنصة بملف `manifest.json` وأيقونات بأعلى دقة متوافقة مع جميع شاشات الهواتف:
- يمكن لأي عميل أو كابتن فتح الرابط `https://app.hatly.com` من متصفح الهاتف (Safari أو Chrome) والضغط على:
  **"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)**.
- سيعمل التطبيق في وضع ملء الشاشة (Standalone) بدون شريط متصفح ومزود بخاصية التخزين المؤقت وتحديد الموقع الجغرافي بالـ GPS.

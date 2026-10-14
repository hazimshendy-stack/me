# التثبيت عبر setup.js

## المتطلبات

- **Node.js LTS** (يُنصح بـ 20.x أو أحدث).
- **npm** (يأتي مع Node).
- **Git** (مطلوب لتهيئة المستودع المحلي).
- **GitHub CLI (gh)** اختياري للرفع التلقائي. يجب تشغيل `gh auth login` مرة واحدة.

## التشغيل

```bash
node setup.js
```

## الخيارات

| الخيار | الوصف |
| --- | --- |
| `--yes` | تشغيل غير تفاعلي حيثما أمكن |
| `--no-github` | بناء وفحص فقط دون محاولة الرفع إلى GitHub |
| `--public` | إنشاء المستودع public (الافتراضي private) |
| `--deploy-pages` | محاولة تهيئة النشر على GitHub Pages عند توفر الأدوات |
| `--help` | عرض الاستخدام |

## ما يفعله السكربت

1. يتحقق من Node وnpm وGit.
2. ينشئ مجلد `shendy-life-calendar` (أو مجلدًا بديلًا آمنًا إذا كان الاسم مشغولًا).
3. يكتب **جميع** ملفات المشروع فعليًا (HTML/TS/TSX/CSS/tests/docs/config).
4. إن وُجدا، ينسخ `README_SCHEDULE.txt` و `WEEKLY_SCHEDULE.txt` إلى
   `docs/reference/`.
5. يثبّت الاعتماديات (`npm ci` عند توفر lockfile صالح، وإلا `npm install`).
6. يشغّل Typecheck وLint وTests وBuild، مع إعادة محاولة تلقائية آمنة حتى
   ثلاث دورات عند الفشل (Prettier + ESLint --fix)، دون `npm audit fix --force`
   أو أوامر مدمرة.
7. يُهيّئ Git داخل مجلد المشروع، وينشئ أول commit.
8. إذا كانت مصادقة `gh` متاحة، ينشئ مستودعًا ويبدفع الكود (بدون force).
9. يكتب `SETUP_REPORT.md` بملخص حقيقي دون أسرار.

## ما لا يفعله السكربت

- لا يطلب منك لصق Personal Access Token.
- لا يدفع بـ `--force`، ولا يحذف فروعًا أو ملفات.
- لا يحوّل المستودع إلى public دون `--public`.
- لا يدّعي نجاحًا لم يتحقق منه.

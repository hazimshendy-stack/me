# التطوير

## البنية

```
src/
├── domain/        # القواعد الثابتة: المحاور، الدورة، وظائف البزنس، الكلية
├── storage/       # localStorage + schemaVersion
├── state/         # Store (React context + useReducer)
├── utils/         # date + export/import
├── components/    # واجهة المستخدم
├── styles/        # global.css
└── __tests__/     # اختبارات الوحدة
```

## أوامر التطوير

```bash
npm run dev         # خادم التطوير
npm run build       # بناء إنتاجي إلى dist/
npm run preview     # معاينة المخرج الإنتاجي
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint
npm test            # Vitest
npm run test:watch  # Vitest في وضع المراقبة
npm run format      # Prettier
```

## قرارات تصميمية مهمة

- `src/domain/cycle.ts` مصدر حقيقة واحد لدورة A/B/C. `businessSessionIndex`
  يحسب ترتيب جلسات Business المتتابعة دون إعادة العد عند انتقال C → A.
- مهام غير موقّتة تُخزَّن بـ `flexible: true` وبدون `startTime`/`endTime`،
  ولا يُخترع لها وقت.
- `localStorage` مخزَّن مع `schemaVersion` لدعم الترقية المستقبلية.

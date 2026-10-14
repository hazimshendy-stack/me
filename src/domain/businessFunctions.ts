export interface BusinessFunction {
  id: number;
  name: string;
  nameAr: string;
  scope: string;
}

// Seven business functions, in the source order. Keep DI as written until
// its intended meaning is defined; do not invent an expansion.
export const BUSINESS_FUNCTIONS: BusinessFunction[] = [
  {
    id: 1,
    name: 'Sooq',
    nameAr: 'سوق',
    scope:
      'التسويق، التصميم الجرافيكي، تحرير الفيديو، الأنيميشن، الموشن جرافيك، المبيعات، وسائل التواصل الاجتماعي، بناء العلامة التجارية.',
  },
  {
    id: 2,
    name: 'V2 Labs',
    nameAr: 'V2 Labs',
    scope:
      'ريادة الأعمال، تطوير الأعمال، البحث والتطوير R&D، القيادة والتطوير، علوم المنتجات وتطويرها، الابتكار، العلاقات العامة PR.',
  },
  {
    id: 3,
    name: 'Money',
    nameAr: 'Money',
    scope: 'المالية، المحاسبة، الاستثمار، التحليل والتخطيط المالي.',
  },
  {
    id: 4,
    name: 'Legal',
    nameAr: 'Legal',
    scope: 'تأسيس وتنظيم الشركات، العقود، الضرائب، المسائل التجارية والقانونية.',
  },
  {
    id: 5,
    name: 'People',
    nameAr: 'People',
    scope: 'الموارد البشرية، خدمة العملاء، تجربة العملاء.',
  },
  {
    id: 6,
    name: 'Operations & Production',
    nameAr: 'Operations & Production',
    scope: 'إدارة العمليات والإنتاج، سلاسل الإمداد، التنسيق والتسليم، الجودة.',
  },
  {
    id: 7,
    name: 'Data',
    nameAr: 'Data',
    scope: 'BA، BI، الاستشارات، DI (المعنى لم يُحدَّد بعد)، DS، DE.',
  },
];

/**
 * Return the business function for the Nth successive Business session
 * (0-based index). The sequence continues forward indefinitely; it does NOT
 * reset when a new A/B/C cycle begins.
 */
export function businessFunctionForSession(sessionIndex: number): BusinessFunction {
  const n = BUSINESS_FUNCTIONS.length;
  const i = ((sessionIndex % n) + n) % n;
  return BUSINESS_FUNCTIONS[i];
}

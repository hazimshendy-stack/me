import { ChevronLeft, ChevronRight, Plus, Search, CalendarDays } from 'lucide-react';
import { AR_MONTHS, formatDateAr, isoWeekNumber } from '../utils/date';

export type ViewKind = 'month' | 'week' | 'day' | 'agenda';

export interface HeaderProps {
  view: ViewKind;
  anchor: Date;
  onView: (v: ViewKind) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAdd: () => void;
  search: string;
  onSearch: (s: string) => void;
  onOpenSettings: () => void;
}

export function Header(p: HeaderProps): JSX.Element {
  const label = (() => {
    if (p.view === 'month') return AR_MONTHS[p.anchor.getMonth()] + ' ' + p.anchor.getFullYear();
    if (p.view === 'week') {
      const d = new Date(p.anchor);
      return (
        'الأسبوع ' + isoWeekNumber(d) + ' — ' + AR_MONTHS[d.getMonth()] + ' ' + d.getFullYear()
      );
    }
    return formatDateAr(p.anchor);
  })();

  return (
    <header className="app-header">
      <div className="header-left">
        <button className="btn primary" onClick={p.onAdd} aria-label="إضافة حدث">
          <Plus size={16} aria-hidden="true" />
          <span>إضافة</span>
        </button>
        <button className="btn ghost" onClick={p.onToday} aria-label="اليوم">
          <CalendarDays size={16} aria-hidden="true" />
          <span>اليوم</span>
        </button>
        <div className="nav-group" role="group" aria-label="التنقل الزمني">
          <button className="icon-btn" onClick={p.onPrev} aria-label="السابق">
            <ChevronRight size={18} aria-hidden="true" />
          </button>
          <button className="icon-btn" onClick={p.onNext} aria-label="التالي">
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
        </div>
        <h1 className="header-title">{label}</h1>
      </div>

      <div className="header-right">
        <div className="search-wrap">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={p.search}
            onChange={(e) => p.onSearch(e.target.value)}
            placeholder="بحث في الأحداث والمهام"
            aria-label="بحث"
          />
        </div>
        <div className="view-switch" role="tablist" aria-label="طريقة العرض">
          {(['month', 'week', 'day', 'agenda'] as ViewKind[]).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={p.view === v}
              className={'view-btn' + (p.view === v ? ' active' : '')}
              onClick={() => p.onView(v)}
            >
              {v === 'month' ? 'شهر' : v === 'week' ? 'أسبوع' : v === 'day' ? 'يوم' : 'أجندة'}
            </button>
          ))}
        </div>
        <button className="btn ghost" onClick={p.onOpenSettings} aria-label="الإعدادات">
          الإعدادات
        </button>
      </div>
    </header>
  );
}

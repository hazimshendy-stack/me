import { Filter, Plus } from 'lucide-react';
import { PILLARS, PILLAR_LABELS_AR, type Pillar } from '../domain/types';

export interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  activePillars: Set<Pillar>;
  onTogglePillar: (p: Pillar) => void;
  onAdd: () => void;
  anchor: Date;
  onPickDate: (d: Date) => void;
  budgetWarning: string | null;
}

function MiniMonth({ anchor, onPickDate }: { anchor: Date; onPickDate: (d: Date) => void }) {
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  const first = new Date(y, m, 1);
  const startOffset = first.getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  return (
    <div className="mini-month" aria-label="مصغر الشهر">
      <div className="mini-month-grid">
        {['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'].map((d) => (
          <div key={d} className="mini-dow">
            {d}
          </div>
        ))}
        {cells.map((c, i) => (
          <button
            key={i}
            className={
              'mini-day' +
              (c === null ? ' empty' : '') +
              (c !== null && c === anchor.getDate() ? ' current' : '')
            }
            disabled={c === null}
            onClick={() => c !== null && onPickDate(new Date(y, m, c))}
          >
            {c ?? ''}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Sidebar(p: SidebarProps): JSX.Element {
  return (
    <aside className={'sidebar' + (p.collapsed ? ' collapsed' : '')} aria-label="لوحة جانبية">
      <div className="sidebar-top">
        <button className="btn primary wide" onClick={p.onAdd} aria-label="إنشاء حدث">
          <Plus size={16} aria-hidden="true" /> <span>إنشاء</span>
        </button>
        <button className="btn ghost small" onClick={p.onToggle} aria-label="طيّ اللوحة">
          {p.collapsed ? 'إظهار' : 'طيّ'}
        </button>
      </div>

      {!p.collapsed && (
        <>
          <MiniMonth anchor={p.anchor} onPickDate={p.onPickDate} />

          <section className="sidebar-section" aria-label="فلاتر المحاور">
            <h2 className="sidebar-title">
              <Filter size={14} aria-hidden="true" /> المحاور
            </h2>
            <ul className="pillar-list">
              {PILLARS.map((pl) => (
                <li key={pl}>
                  <label className="pillar-item">
                    <input
                      type="checkbox"
                      checked={p.activePillars.has(pl)}
                      onChange={() => p.onTogglePillar(pl)}
                    />
                    <span>{PILLAR_LABELS_AR[pl]}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          {p.budgetWarning && (
            <div className="budget-warning" role="note">
              <strong>تنبيه ميزانية الوقت</strong>
              <p>{p.budgetWarning}</p>
            </div>
          )}
        </>
      )}
    </aside>
  );
}

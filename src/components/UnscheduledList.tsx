import type { CalendarEvent } from '../domain/types';
import { PILLAR_LABELS_AR } from '../domain/types';

export interface UnscheduledProps {
  events: CalendarEvent[];
  onSchedule: (ev: CalendarEvent) => void;
  onEdit: (ev: CalendarEvent) => void;
}

export function UnscheduledList(p: UnscheduledProps): JSX.Element {
  if (p.events.length === 0) {
    return (
      <section className="unscheduled">
        <h2 className="sidebar-title">غير مجدولة</h2>
        <p className="muted">
          لا توجد مهام بدون وقت. القوالب التي تُنشئها ستظهر هنا حتى تحدّد لها موعدًا.
        </p>
      </section>
    );
  }
  return (
    <section className="unscheduled" aria-label="مهام غير مجدولة">
      <h2 className="sidebar-title">غير مجدولة ({p.events.length})</h2>
      <ul className="unscheduled-list">
        {p.events.map((e) => (
          <li key={e.id} className="unscheduled-item">
            <div className="unscheduled-head">
              <span className={'chip chip-' + e.pillar}>{PILLAR_LABELS_AR[e.pillar]}</span>
              <span className="unscheduled-title">{e.title}</span>
            </div>
            <div className="unscheduled-meta">
              {e.durationMinutes ? <span>{e.durationMinutes} د</span> : null}
              {e.track ? <span> · {e.track}</span> : null}
            </div>
            <div className="unscheduled-actions">
              <button className="btn small" onClick={() => p.onSchedule(e)}>
                تحديد موعد
              </button>
              <button className="btn ghost small" onClick={() => p.onEdit(e)}>
                تفاصيل
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

import type { CalendarEvent } from '../domain/types';
import { PILLAR_LABELS_AR } from '../domain/types';
import { formatDateAr, parseISODate } from '../utils/date';

export function AgendaView({
  events,
  onOpenEvent,
}: {
  events: CalendarEvent[];
  onOpenEvent: (e: CalendarEvent) => void;
}): JSX.Element {
  const sorted = events
    .slice()
    .sort((a, b) => (a.date + (a.startTime || '')).localeCompare(b.date + (b.startTime || '')));
  if (sorted.length === 0) {
    return (
      <div className="agenda-empty">
        <p className="muted">لا أحداث لعرضها. ابدأ بإضافة حدث أو استورد نسخة احتياطية.</p>
      </div>
    );
  }
  const groups = new Map<string, CalendarEvent[]>();
  for (const e of sorted) {
    const arr = groups.get(e.date) || [];
    arr.push(e);
    groups.set(e.date, arr);
  }
  return (
    <div className="agenda">
      {Array.from(groups.entries()).map(([date, list]) => (
        <section key={date} className="agenda-group">
          <h3 className="agenda-date">{formatDateAr(parseISODate(date))}</h3>
          <ul className="agenda-list">
            {list.map((e) => (
              <li key={e.id} className={'agenda-item chip-' + e.pillar}>
                <button className="agenda-btn" onClick={() => onOpenEvent(e)}>
                  <span className="agenda-time">{e.startTime || 'غير محدد'}</span>
                  <span className="agenda-pillar">{PILLAR_LABELS_AR[e.pillar]}</span>
                  <span className="agenda-title">{e.title}</span>
                  <span className={'status status-' + e.status}>{statusAr(e.status)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function statusAr(s: CalendarEvent['status']): string {
  switch (s) {
    case 'not_started':
      return 'لم يبدأ';
    case 'in_progress':
      return 'قيد التنفيذ';
    case 'done':
      return 'منجز';
    case 'deferred':
      return 'مؤجل';
  }
}

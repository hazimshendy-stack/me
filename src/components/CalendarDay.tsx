import { AR_DAYS_LONG, formatDateAr, toISODate } from '../utils/date';
import type { CalendarEvent } from '../domain/types';
import { PILLAR_LABELS_AR } from '../domain/types';

export interface DayProps {
  anchor: Date;
  events: CalendarEvent[];
  onOpenEvent: (e: CalendarEvent) => void;
}

export function CalendarDay(p: DayProps): JSX.Element {
  const iso = toISODate(p.anchor);
  const dayEvents = p.events.filter((e) => e.date === iso);
  const timed = dayEvents.filter((e) => !e.flexible && e.startTime);
  const flexible = dayEvents.filter((e) => e.flexible || !e.startTime);

  return (
    <div className="day-view">
      <h2 className="day-title">
        {AR_DAYS_LONG[p.anchor.getDay()]} — {formatDateAr(p.anchor)}
      </h2>

      <section className="day-section">
        <h3>المواعيد المحددة</h3>
        {timed.length === 0 ? (
          <p className="muted">
            لا مواعيد محددة. الأهداف اليومية تظهر في قسم «غير موقّتة» حتى تحدّد وقتها.
          </p>
        ) : (
          <ul className="day-list">
            {timed
              .slice()
              .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
              .map((e) => (
                <li key={e.id} className={'day-item chip-' + e.pillar}>
                  <button className="day-item-btn" onClick={() => p.onOpenEvent(e)}>
                    <span className="day-time">
                      {e.startTime} – {e.endTime || ''}
                    </span>
                    <span className="day-pillar">{PILLAR_LABELS_AR[e.pillar]}</span>
                    <span className="day-title-text">{e.title}</span>
                    {e.durationMinutes ? (
                      <span className="day-dur">{e.durationMinutes}د</span>
                    ) : null}
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>

      <section className="day-section">
        <h3>غير موقّتة (يومية / قوالب)</h3>
        {flexible.length === 0 ? (
          <p className="muted">لا قوالب غير موقّتة لليوم.</p>
        ) : (
          <ul className="day-list">
            {flexible.map((e) => (
              <li key={e.id} className={'day-item flex chip-' + e.pillar}>
                <button className="day-item-btn" onClick={() => p.onOpenEvent(e)}>
                  <span className="day-pillar">{PILLAR_LABELS_AR[e.pillar]}</span>
                  <span className="day-title-text">{e.title}</span>
                  {e.durationMinutes ? <span className="day-dur">{e.durationMinutes}د</span> : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

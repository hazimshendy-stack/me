import { addDays, AR_DAYS_LONG, toISODate } from '../utils/date';
import type { CalendarEvent } from '../domain/types';
import { PILLAR_LABELS_AR } from '../domain/types';

export interface WeekProps {
  anchor: Date;
  events: CalendarEvent[];
  onOpenEvent: (e: CalendarEvent) => void;
  onPickSlot?: (date: string, hour: number) => void;
}

export function CalendarWeek(p: WeekProps): JSX.Element {
  const weekStart = new Date(p.anchor);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 07..21

  const byDay = new Map<string, CalendarEvent[]>();
  for (const e of p.events) {
    const k = e.date;
    const arr = byDay.get(k) || [];
    arr.push(e);
    byDay.set(k, arr);
  }

  const todayISO = toISODate(new Date());

  return (
    <div className="week-view">
      <div className="week-head">
        <div className="week-gutter" />
        {days.map((d) => {
          const iso = toISODate(d);
          const isToday = iso === todayISO;
          const dayEvents = (byDay.get(iso) || []).filter((e) => !e.flexible && e.startTime);
          return (
            <div key={iso} className={'week-col-head' + (isToday ? ' today' : '')}>
              <div className="week-dow">{AR_DAYS_LONG[d.getDay()]}</div>
              <div className="week-daynum">{d.getDate()}</div>
              <div className="week-flex-badge">
                {dayEvents.length === 0 ? 'لا مواعيد محددة' : dayEvents.length + ' موعد'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="week-body">
        <div className="week-gutter-col">
          {hours.map((h) => (
            <div key={h} className="hour-label">
              {h.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>
        {days.map((d) => {
          const iso = toISODate(d);
          const dayEvents = byDay.get(iso) || [];
          return (
            <div key={iso} className="week-col">
              {hours.map((h) => {
                const slotEvs = dayEvents.filter((e) => {
                  if (e.flexible || !e.startTime) return false;
                  const hh = Number(e.startTime.split(':')[0]);
                  return hh === h;
                });
                return (
                  <div
                    key={h}
                    className="hour-slot"
                    onClick={() => p.onPickSlot && p.onPickSlot(iso, h)}
                  >
                    {slotEvs.map((e) => (
                      <button
                        key={e.id}
                        className={'slot-event chip-' + e.pillar}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          p.onOpenEvent(e);
                        }}
                        aria-label={PILLAR_LABELS_AR[e.pillar] + ' — ' + e.title}
                      >
                        <span className="slot-title">{e.title}</span>
                        <span className="slot-sub">
                          {e.startTime} – {e.endTime || ''}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

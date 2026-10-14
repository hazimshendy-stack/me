import { AR_DAYS_SHORT, startOfMonth, toISODate, addDays } from '../utils/date';
import type { CalendarEvent } from '../domain/types';
import { PILLAR_LABELS_AR } from '../domain/types';

export interface MonthProps {
  anchor: Date;
  events: CalendarEvent[];
  onPickDate: (d: Date) => void;
  onOpenEvent: (e: CalendarEvent) => void;
}

export function CalendarMonth(p: MonthProps): JSX.Element {
  const first = startOfMonth(p.anchor);
  const start = new Date(first);
  start.setDate(start.getDate() - start.getDay());
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) cells.push(addDays(start, i));

  const byDate = new Map<string, CalendarEvent[]>();
  for (const e of p.events) {
    const k = e.date;
    const arr = byDate.get(k) || [];
    arr.push(e);
    byDate.set(k, arr);
  }

  const todayISO = toISODate(new Date());

  return (
    <div className="month-grid" role="grid" aria-label="عرض الشهر">
      {AR_DAYS_SHORT.map((d) => (
        <div key={d} className="month-dow" role="columnheader">
          {d}
        </div>
      ))}
      {cells.map((d, i) => {
        const iso = toISODate(d);
        const inMonth = d.getMonth() === p.anchor.getMonth();
        const list = (byDate.get(iso) || []).slice(0, 3);
        const more = (byDate.get(iso) || []).length - list.length;
        return (
          <div
            key={i}
            role="gridcell"
            className={'month-cell' + (inMonth ? '' : ' out') + (iso === todayISO ? ' today' : '')}
            onClick={() => p.onPickDate(d)}
          >
            <div className="month-daynum">{d.getDate()}</div>
            <ul className="month-events">
              {list.map((e) => (
                <li
                  key={e.id}
                  className={'month-ev chip-' + e.pillar}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    p.onOpenEvent(e);
                  }}
                >
                  <span className="ev-dot" aria-hidden="true" />
                  <span className="ev-time">{e.startTime || ''}</span>
                  <span className="ev-title">
                    {PILLAR_LABELS_AR[e.pillar]} · {e.title}
                  </span>
                </li>
              ))}
              {more > 0 && <li className="month-more">+{more} أخرى</li>}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

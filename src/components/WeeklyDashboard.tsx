import type { AppState } from '../domain/types';
import { PILLAR_LABELS_AR, PILLARS, type Pillar } from '../domain/types';
import { toISODate, addDays, startOfWeekSunday } from '../utils/date';

function plannedMinutes(state: AppState): Record<Pillar, number> {
  const map: Record<Pillar, number> = {
    Allah: 0,
    Health: 0,
    Admin: 0,
    Science: 0,
    Work: 0,
    College: 0,
    Project: 0,
  };
  for (const e of state.events) {
    if (!e.durationMinutes) continue;
    map[e.pillar] += e.durationMinutes;
  }
  return map;
}

function actualMinutes(state: AppState): Record<Pillar, number> {
  const map: Record<Pillar, number> = {
    Allah: 0,
    Health: 0,
    Admin: 0,
    Science: 0,
    Work: 0,
    College: 0,
    Project: 0,
  };
  for (const e of state.events) {
    if (!e.actualMinutes) continue;
    map[e.pillar] += e.actualMinutes;
  }
  return map;
}

export function WeeklyDashboard({ state }: { state: AppState }): JSX.Element {
  const start = startOfWeekSunday(new Date());
  const isoStart = toISODate(start);
  const isoEnd = toISODate(addDays(start, 6));
  const weekEvents = state.events.filter((e) => e.date >= isoStart && e.date <= isoEnd);

  const planned = plannedMinutes({ ...state, events: weekEvents });
  const actual = actualMinutes({ ...state, events: weekEvents });

  const done = weekEvents.filter((e) => e.status === 'done').length;
  const inProgress = weekEvents.filter((e) => e.status === 'in_progress').length;
  const deferred = weekEvents.filter((e) => e.status === 'deferred').length;

  const hours = (m: number) => (m / 60).toFixed(1);

  return (
    <div className="dashboard">
      <h2>لوحة الأسبوع</h2>
      <p className="muted small">
        {isoStart} → {isoEnd}
      </p>

      <div className="dashboard-kpis">
        <div className="kpi">
          <span className="kpi-num">{weekEvents.length}</span>
          <span className="kpi-lbl">إجمالي المهام</span>
        </div>
        <div className="kpi">
          <span className="kpi-num">{done}</span>
          <span className="kpi-lbl">منجزة</span>
        </div>
        <div className="kpi">
          <span className="kpi-num">{inProgress}</span>
          <span className="kpi-lbl">قيد التنفيذ</span>
        </div>
        <div className="kpi">
          <span className="kpi-num">{deferred}</span>
          <span className="kpi-lbl">مؤجلة</span>
        </div>
      </div>

      <table className="dashboard-table">
        <thead>
          <tr>
            <th>المحور</th>
            <th>مخطط (ساعة)</th>
            <th>فعلي (ساعة)</th>
            <th>الفرق</th>
          </tr>
        </thead>
        <tbody>
          {PILLARS.map((pl) => {
            const p = planned[pl] / 60;
            const a = actual[pl] / 60;
            const d = a - p;
            return (
              <tr key={pl}>
                <td>{PILLAR_LABELS_AR[pl]}</td>
                <td>{p.toFixed(1)}</td>
                <td>{a.toFixed(1)}</td>
                <td className={d < 0 ? 'neg' : d > 0 ? 'pos' : ''}>
                  {d === 0 ? '0.0' : (d > 0 ? '+' : '') + d.toFixed(1)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="dashboard-project">
        <h3>المشروع النشط</h3>
        {state.project && state.project.name ? (
          <div>
            <p>
              <strong>{state.project.name}</strong>
            </p>
            <p className="muted">{state.project.description}</p>
            <p>التسليم الأسبوعي: {state.project.weeklyDeliverable || '—'}</p>
            <p>الخطوة التالية: {state.project.nextAction || '—'}</p>
          </div>
        ) : (
          <p className="muted">حدّد المشروع النشط من الإعدادات.</p>
        )}
      </div>

      <p className="muted small">
        الأرقام محسوبة من أحداث هذا الأسبوع فقط. الفعلي{' '}
        {hours(Object.values(actual).reduce((a, b) => a + b, 0))} ساعة مقابل مخطط{' '}
        {hours(Object.values(planned).reduce((a, b) => a + b, 0))} ساعة.
      </p>
    </div>
  );
}

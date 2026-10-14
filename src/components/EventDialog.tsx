import { useEffect, useState } from 'react';
import type { CalendarEvent, EventStatus, Pillar } from '../domain/types';
import { PILLARS, PILLAR_LABELS_AR } from '../domain/types';
import { BUSINESS_FUNCTIONS } from '../domain/businessFunctions';
import { COLLEGE_SUBJECTS } from '../domain/college';
import { newId } from '../domain/id';
import { durationBetween } from '../utils/date';

export interface EventDialogProps {
  open: boolean;
  initial?: CalendarEvent | null;
  onClose: () => void;
  onSave: (ev: CalendarEvent) => void;
  onDelete?: (id: string) => void;
  defaultDate?: string;
}

function emptyEvent(defaultDate?: string): CalendarEvent {
  return {
    id: newId(),
    title: '',
    pillar: 'Work',
    date: defaultDate || new Date().toISOString().slice(0, 10),
    flexible: true,
    status: 'not_started',
  };
}

export function EventDialog(p: EventDialogProps): JSX.Element | null {
  const [ev, setEv] = useState<CalendarEvent>(() => p.initial ?? emptyEvent(p.defaultDate));

  useEffect(() => {
    if (p.open) setEv(p.initial ?? emptyEvent(p.defaultDate));
  }, [p.open, p.initial, p.defaultDate]);

  if (!p.open) return null;

  const showTrackOptions =
    ev.pillar === 'Science' || ev.pillar === 'College' || ev.pillar === 'Work';

  function set<K extends keyof CalendarEvent>(k: K, v: CalendarEvent[K]) {
    setEv((s) => ({ ...s, [k]: v }));
  }

  function commit() {
    if (!ev.title.trim()) return;
    let duration = ev.durationMinutes;
    if (ev.startTime && ev.endTime) {
      const d = durationBetween(ev.startTime, ev.endTime);
      if (d) duration = d;
    }
    p.onSave({ ...ev, durationMinutes: duration });
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="تفاصيل الحدث">
      <div className="modal">
        <header className="modal-head">
          <h2>{p.initial ? 'تعديل الحدث' : 'حدث جديد'}</h2>
          <button className="icon-btn" onClick={p.onClose} aria-label="إغلاق">
            ×
          </button>
        </header>

        <div className="modal-body">
          <label className="field">
            <span>العنوان</span>
            <input
              value={ev.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="مثال: جلسة علم — Business"
            />
          </label>

          <label className="field">
            <span>المحور</span>
            <select value={ev.pillar} onChange={(e) => set('pillar', e.target.value as Pillar)}>
              {PILLARS.map((pl) => (
                <option key={pl} value={pl}>
                  {PILLAR_LABELS_AR[pl]}
                </option>
              ))}
            </select>
          </label>

          {showTrackOptions && (
            <label className="field">
              <span>المسار / المادة / فرع البزنس</span>
              <input
                list="track-options"
                value={ev.track || ''}
                onChange={(e) => set('track', e.target.value)}
                placeholder="اتركه فارغًا إن لم يحدد بعد"
              />
              <datalist id="track-options">
                {BUSINESS_FUNCTIONS.map((b) => (
                  <option key={b.name} value={b.name}>
                    {b.nameAr}
                  </option>
                ))}
                {COLLEGE_SUBJECTS.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.nameAr}
                  </option>
                ))}
              </datalist>
            </label>
          )}

          <label className="field">
            <span>التاريخ</span>
            <input type="date" value={ev.date} onChange={(e) => set('date', e.target.value)} />
          </label>

          <div className="field-row">
            <label className="field">
              <span>وقت البداية (اختياري)</span>
              <input
                type="time"
                value={ev.startTime || ''}
                onChange={(e) => set('startTime', e.target.value || undefined)}
              />
            </label>
            <label className="field">
              <span>وقت النهاية (اختياري)</span>
              <input
                type="time"
                value={ev.endTime || ''}
                onChange={(e) => set('endTime', e.target.value || undefined)}
              />
            </label>
          </div>

          <div className="field-row">
            <label className="field">
              <span>المدة المستهدفة (دقائق)</span>
              <input
                type="number"
                min={0}
                value={ev.durationMinutes ?? ''}
                onChange={(e) =>
                  set('durationMinutes', e.target.value ? Number(e.target.value) : undefined)
                }
              />
            </label>
            <label className="field checkbox">
              <input
                type="checkbox"
                checked={ev.flexible}
                onChange={(e) => set('flexible', e.target.checked)}
              />
              <span>حدث مرن (غير محدد الوقت)</span>
            </label>
          </div>

          <label className="field">
            <span>المخرجات المتوقعة</span>
            <input value={ev.outputs || ''} onChange={(e) => set('outputs', e.target.value)} />
          </label>

          <label className="field">
            <span>الحالة</span>
            <select
              value={ev.status}
              onChange={(e) => set('status', e.target.value as EventStatus)}
            >
              <option value="not_started">لم يبدأ</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="done">منجز</option>
              <option value="deferred">مؤجل</option>
            </select>
          </label>

          <label className="field">
            <span>الخطوة التالية</span>
            <input
              value={ev.nextAction || ''}
              onChange={(e) => set('nextAction', e.target.value)}
            />
          </label>

          <label className="field">
            <span>العائق</span>
            <input value={ev.blocker || ''} onChange={(e) => set('blocker', e.target.value)} />
          </label>

          <label className="field">
            <span>ملاحظات</span>
            <textarea
              value={ev.notes || ''}
              onChange={(e) => set('notes', e.target.value)}
              rows={3}
            />
          </label>
        </div>

        <footer className="modal-foot">
          {p.initial && p.onDelete && (
            <button
              className="btn danger"
              onClick={() => {
                if (window.confirm('حذف هذا الحدث نهائيًا؟')) p.onDelete!(p.initial!.id);
              }}
            >
              حذف
            </button>
          )}
          <div className="spacer" />
          <button className="btn ghost" onClick={p.onClose}>
            إلغاء
          </button>
          <button className="btn primary" onClick={commit} disabled={!ev.title.trim()}>
            حفظ
          </button>
        </footer>
      </div>
    </div>
  );
}

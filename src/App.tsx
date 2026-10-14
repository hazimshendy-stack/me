import { useCallback, useMemo, useState } from 'react';
import { StoreProvider, useStore } from './state/store';
import { Header, type ViewKind } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CalendarMonth } from './components/CalendarMonth';
import { CalendarWeek } from './components/CalendarWeek';
import { CalendarDay } from './components/CalendarDay';
import { AgendaView } from './components/AgendaView';
import { EventDialog } from './components/EventDialog';
import { UnscheduledList } from './components/UnscheduledList';
import { WeeklyDashboard } from './components/WeeklyDashboard';
import { SettingsPanel } from './components/SettingsPanel';
import { ToastView, type ToastMsg } from './components/Toast';
import { PILLARS, type CalendarEvent, type Pillar } from './domain/types';
import { addDays, toISODate } from './utils/date';
import { newId } from './domain/id';

function Shell(): JSX.Element {
  const { state, dispatch } = useStore();
  const [view, setView] = useState<ViewKind>('week');
  const [anchor, setAnchor] = useState<Date>(new Date());
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [activePillars, setActivePillars] = useState<Set<Pillar>>(new Set(PILLARS));
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const notify = useCallback((text: string, kind: 'info' | 'success' | 'error' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const visibleEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return state.events.filter((e) => {
      if (!activePillars.has(e.pillar)) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        (e.track || '').toLowerCase().includes(q) ||
        (e.outputs || '').toLowerCase().includes(q)
      );
    });
  }, [state.events, activePillars, search]);

  const unscheduled = useMemo(
    () => visibleEvents.filter((e) => e.flexible || !e.startTime),
    [visibleEvents],
  );

  const budgetWarning = useMemo(() => {
    if (!state.settings.showBudgetWarnings) return null;
    const t = state.settings.targets;
    const total =
      t.allahHours +
      t.healthAdminHours +
      t.scienceHours +
      t.workHours +
      t.collegeHours +
      t.projectHours;
    if (total >= 24) {
      return (
        'مجموع الأهداف الأساسية ' +
        total +
        ' ساعة، وهذا يقترب من أو يبلغ 24 ساعة، دون هامش للتنقل أو الراحة. المرجع يستخدم عمليًا ساعتين للمشروع في أيام التركيز.'
      );
    }
    return null;
  }, [state.settings]);

  const goPrev = () => {
    if (view === 'month') {
      const d = new Date(anchor);
      d.setMonth(d.getMonth() - 1);
      setAnchor(d);
    } else if (view === 'week') {
      setAnchor(addDays(anchor, -7));
    } else if (view === 'day') {
      setAnchor(addDays(anchor, -1));
    }
  };
  const goNext = () => {
    if (view === 'month') {
      const d = new Date(anchor);
      d.setMonth(d.getMonth() + 1);
      setAnchor(d);
    } else if (view === 'week') {
      setAnchor(addDays(anchor, 7));
    } else if (view === 'day') {
      setAnchor(addDays(anchor, 1));
    }
  };
  const goToday = () => setAnchor(new Date());

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const saveEvent = (ev: CalendarEvent) => {
    dispatch({ type: 'upsertEvent', event: { ...ev, id: ev.id || newId() } });
    setDialogOpen(false);
    notify('تم حفظ الحدث.', 'success');
  };

  const deleteEvent = (id: string) => {
    dispatch({ type: 'deleteEvent', id });
    setDialogOpen(false);
    notify('تم حذف الحدث.', 'info');
  };

  const togglePillar = (p: Pillar) => {
    setActivePillars((s) => {
      const n = new Set(s);
      if (n.has(p)) n.delete(p);
      else n.add(p);
      return n;
    });
  };

  const openEvent = (e: CalendarEvent) => {
    setEditing(e);
    setDialogOpen(true);
  };

  return (
    <div className={'app' + (sidebarCollapsed ? ' sidebar-collapsed' : '')}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        activePillars={activePillars}
        onTogglePillar={togglePillar}
        onAdd={openNew}
        anchor={anchor}
        onPickDate={(d) => {
          setAnchor(d);
          setView('day');
        }}
        budgetWarning={budgetWarning}
      />

      <main className="main">
        <Header
          view={view}
          anchor={anchor}
          onView={setView}
          onPrev={goPrev}
          onNext={goNext}
          onToday={goToday}
          onAdd={openNew}
          search={search}
          onSearch={setSearch}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <div className="content">
          <section className="calendar-area" aria-label="منطقة التقويم">
            {view === 'month' && (
              <CalendarMonth
                anchor={anchor}
                events={visibleEvents}
                onPickDate={(d) => {
                  setAnchor(d);
                  setView('day');
                }}
                onOpenEvent={openEvent}
              />
            )}
            {view === 'week' && (
              <CalendarWeek
                anchor={anchor}
                events={visibleEvents}
                onOpenEvent={openEvent}
                onPickSlot={(date, hour) => {
                  setEditing({
                    id: newId(),
                    title: '',
                    pillar: 'Work',
                    date,
                    startTime: String(hour).padStart(2, '0') + ':00',
                    endTime: String(hour + 1).padStart(2, '0') + ':00',
                    flexible: false,
                    status: 'not_started',
                  });
                  setDialogOpen(true);
                }}
              />
            )}
            {view === 'day' && (
              <CalendarDay anchor={anchor} events={visibleEvents} onOpenEvent={openEvent} />
            )}
            {view === 'agenda' && <AgendaView events={visibleEvents} onOpenEvent={openEvent} />}
          </section>

          <aside className="right-rail">
            <UnscheduledList
              events={unscheduled}
              onSchedule={(ev) => {
                setEditing(ev);
                setDialogOpen(true);
              }}
              onEdit={(ev) => {
                setEditing(ev);
                setDialogOpen(true);
              }}
            />
            <WeeklyDashboard state={state} />
          </aside>
        </div>
      </main>

      <EventDialog
        open={dialogOpen}
        initial={editing}
        onClose={() => setDialogOpen(false)}
        onSave={saveEvent}
        onDelete={deleteEvent}
        defaultDate={toISODate(anchor)}
      />

      <SettingsPanel
        open={settingsOpen}
        state={state}
        onClose={() => setSettingsOpen(false)}
        onSaveSettings={(s) => dispatch({ type: 'setSettings', settings: s })}
        onSaveProject={(pr) => dispatch({ type: 'setProject', project: pr })}
        onImport={(st) => dispatch({ type: 'replace', state: st })}
        onNotify={notify}
      />

      <ToastView
        items={toasts}
        onDismiss={(id) => setToasts((t) => t.filter((x) => x.id !== id))}
      />
    </div>
  );
}

export default function App(): JSX.Element {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

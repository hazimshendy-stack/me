import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { ActiveProject, AppState, CalendarEvent, Settings } from '../domain/types';
import { buildDefaultState } from '../domain/defaults';
import { loadState, saveState } from '../storage/localStorage';

export type Action =
  | { type: 'upsertEvent'; event: CalendarEvent }
  | { type: 'deleteEvent'; id: string }
  | { type: 'setStatus'; id: string; status: CalendarEvent['status']; actualMinutes?: number }
  | { type: 'setSettings'; settings: Settings }
  | { type: 'setProject'; project: ActiveProject | null }
  | { type: 'replace'; state: AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'upsertEvent': {
      const events = state.events.slice();
      const i = events.findIndex((e) => e.id === action.event.id);
      if (i >= 0) events[i] = action.event;
      else events.push(action.event);
      return { ...state, events };
    }
    case 'deleteEvent':
      return { ...state, events: state.events.filter((e) => e.id !== action.id) };
    case 'setStatus':
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.id
            ? {
                ...e,
                status: action.status,
                actualMinutes: action.actualMinutes ?? e.actualMinutes,
              }
            : e,
        ),
      };
    case 'setSettings':
      return { ...state, settings: action.settings };
    case 'setProject':
      return { ...state, project: action.project };
    case 'replace':
      return action.state;
    default:
      return state;
  }
}

interface Ctx {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => loadState() ?? buildDefaultState(),
  );
  useEffect(() => {
    saveState(state);
  }, [state]);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): Ctx {
  const v = useContext(StoreCtx);
  if (!v) throw new Error('StoreProvider is missing');
  return v;
}

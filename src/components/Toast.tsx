export type ToastKind = 'info' | 'success' | 'error';

export interface ToastMsg {
  id: number;
  kind: ToastKind;
  text: string;
}

export function ToastView({
  items,
  onDismiss,
}: {
  items: ToastMsg[];
  onDismiss: (id: number) => void;
}): JSX.Element {
  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={'toast toast-' + t.kind}>
          <span>{t.text}</span>
          <button
            className="toast-close"
            onClick={() => onDismiss(t.id)}
            aria-label="إغلاق التنبيه"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

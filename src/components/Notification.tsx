export interface Notice {
  type: 'success' | 'error';
  message: string;
}

interface NotificationProps {
  notice: Notice | null;
  onDismiss: () => void;
}

export function Notification({ notice, onDismiss }: NotificationProps) {
  if (!notice) return null;

  return (
    <div className={`notification notification-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
      <span>{notice.message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss notification">
        ×
      </button>
    </div>
  );
}

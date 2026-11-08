import { HealthState } from '../api/types';

const LABELS: Record<HealthState, string> = {
  checking: 'Checking API…',
  up: 'API online',
  down: 'API unavailable',
};

/** Shows the result of GET /ping. */
export function HealthStatus({ status }: { status: HealthState }) {
  return (
    <span className={`health health-${status}`} role="status">
      {LABELS[status]}
    </span>
  );
}

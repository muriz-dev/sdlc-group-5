import StatusBadge from './StatusBadge.jsx';
import { formatDeadline } from '../utils/dateUtils.js';
import { isOverdueTask } from '../utils/taskUtils.js';

function getUpdateLabel(task) {
  if (task.deadlineUpdatedAt) return 'Deadline updated';
  if (task.instructionsUpdatedAt) return 'Instructions updated';
  return '';
}

export default function TaskCard({ task, isSelected, onSelect, currentTime }) {
  const updateLabel = getUpdateLabel(task);
  const isOverdue = isOverdueTask(task, currentTime);

  return (
    <button
      className={`record-card${isSelected ? ' selected' : ''}`}
      type="button"
      onClick={() => onSelect(task.id)}
      aria-pressed={isSelected}
    >
      <span className="card-heading">
        <span>
          <strong>{task.title}</strong>
          <span className="meta"> · {task.id}</span>
        </span>
        <span className="card-badges">
          {isOverdue && <StatusBadge status="OVERDUE" />}
          {updateLabel && <span className="card-update">{updateLabel}</span>}
          <StatusBadge status={task.status} />
        </span>
      </span>
      <span className="card-footer">
        <span>{task.course}</span>
        <span>Due {formatDeadline(task.dueDate, task.dueTime)}</span>
      </span>
    </button>
  );
}

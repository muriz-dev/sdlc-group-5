import StatusBadge from './StatusBadge.jsx';

export default function TaskCard({ task, isSelected, onSelect }) {
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
        <StatusBadge status={task.status} />
      </span>
      <span className="card-footer">
        <span>{task.course}</span>
        <span>Due {task.dueDate}</span>
      </span>
    </button>
  );
}

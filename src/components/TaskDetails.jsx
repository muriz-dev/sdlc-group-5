import StatusBadge from './StatusBadge.jsx';

export default function TaskDetails({ task, onToggleCompletion }) {
  if (!task) {
    return <div className="empty-state">Select a task to view its details.</div>;
  }

  const isDone = task.status === 'DONE';

  return (
    <>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{task.id}</p>
          <h2>{task.title}</h2>
        </div>
        <StatusBadge status={task.status} />
      </div>

      <dl className="details-list">
        <dt>Course</dt>
        <dd>{task.course}</dd>
        <dt>Due date</dt>
        <dd>{task.dueDate}</dd>
        <dt>Source</dt>
        <dd>{task.source}</dd>
        <dt>Type</dt>
        <dd>{task.type}</dd>
      </dl>

      <button
        className="primary-button"
        type="button"
        onClick={() => onToggleCompletion(task.id)}
      >
        {isDone ? 'Reopen Task' : 'Mark as Done'}
      </button>
    </>
  );
}

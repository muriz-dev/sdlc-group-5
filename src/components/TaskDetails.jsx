import StatusBadge from './StatusBadge.jsx';

const statusActions = {
  TODO: 'Start Task',
  IN_PROGRESS: 'Mark as Done',
  DONE: 'Reopen Task',
};

export default function TaskDetails({ task, onAdvanceStatus }) {
  if (!task) {
    return <div className="empty-state">Select a task to view its details.</div>;
  }

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
        {/* Tambahan untuk Additional Instructions */}
        <dt>Additional Instructions</dt>
        <dd>{task.additionalInstructions || 'Tidak ada instruksi tambahan.'}</dd>
      </dl>

      <button
        className="primary-button"
        type="button"
        onClick={() => onAdvanceStatus(task.id)}
      >
        {statusActions[task.status] ?? 'Update Status'}
      </button>
    </>
  );
}
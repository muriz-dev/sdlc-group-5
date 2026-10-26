import StatusBadge from './StatusBadge.jsx';
import { formatDeadline, formatDeadlineDate } from '../utils/dateUtils.js';

const statusActions = {
  TODO: 'Start Task',
  IN_PROGRESS: 'Mark as Done',
  DONE: 'Reopen Task',
};

export default function TaskDetails({ task, onAdvanceStatus }) {
  if (!task) {
    return <div className="empty-state">Select a task to view its details.</div>;
  }

  const hasDeadlineChange = Boolean(task.deadlineUpdatedAt);
  const hasInstructionChange = Boolean(task.instructionsUpdatedAt);
  const hasUpdates = hasDeadlineChange || hasInstructionChange;

  return (
    <>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{task.id}</p>
          <h2>{task.title}</h2>
        </div>
        <StatusBadge status={task.status} />
      </div>

      {hasUpdates && (
        <section className="change-notice" aria-label="Lecturer updates">
          <p className="change-notice-heading">
            <span className="change-badge">Updated</span>
            This assignment was changed by the lecturer.
          </p>

          {hasDeadlineChange && (
            <div className="change-entry">
              <p className="change-entry-title">Deadline changed</p>
              <p>
                New deadline: <strong>{formatDeadline(task.dueDate, task.dueTime)}</strong>
              </p>
              <p className="change-previous">
                Previous deadline:{' '}
                {formatDeadline(task.previousDueDate, task.previousDueTime)}
              </p>
              <p className="change-meta">
                Updated on {formatDeadlineDate(task.deadlineUpdatedAt)}
              </p>
            </div>
          )}

          {hasInstructionChange && (
            <div className="change-entry">
              <p className="change-entry-title">Instructions updated</p>
              <p className="change-meta">
                Updated on {formatDeadlineDate(task.instructionsUpdatedAt)}
              </p>
            </div>
          )}
        </section>
      )}

      <dl className="details-list">
        <dt>Course</dt>
        <dd>{task.course}</dd>
        <dt>Due date</dt>
        <dd>
          {formatDeadlineDate(task.dueDate)}
          {hasDeadlineChange && <span className="change-marker">Changed</span>}
        </dd>
        <dt>Due time</dt>
        <dd>{task.dueTime} (24-hour)</dd>
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
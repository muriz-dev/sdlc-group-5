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

  const handleMagdalenaAction = () => {
    alert("Fitur verifikasi oleh Magdalena berhasil dijalankan!");
  };

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
        <dt>Additional Instructions</dt>
        <dd>{task.additionalInstructions || 'Tidak ada instruksi tambahan.'}</dd>
      </dl>

      <section className="task-detail-section" aria-label="Task description">
        <h3>Description</h3>
        <p className="task-description">{task.description || 'No description provided.'}</p>
      </section>

      {/* Tombol Fitur Interaktif Magdalena */}
      <div style={{ margin: '16px 0' }}>
        <button
          type="button"
          onClick={handleMagdalenaAction}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ✨ Tandai Telah Direview oleh Magdalena
        </button>
      </div>

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
import { useEffect, useState } from 'react';
import TaskDetails from './components/TaskDetails.jsx';
import TaskList from './components/TaskList.jsx';
import ResetControl from './components/ResetControl.jsx';
import { createSeedData } from './data/seed.js';
import {
  advanceTaskStatus,
  getTaskCounts,
  getVisibleTasks,
} from './utils/taskUtils.js';
import { loadState, resetState, saveState } from './utils/storage.js';

const STORAGE_KEY = 'sdlc:case-c:v1';

export default function App() {
  const [data, setData] = useState(() => loadState(STORAGE_KEY, createSeedData));
  const [selectedId, setSelectedId] = useState(
    () => getVisibleTasks(data.tasks, false)[0]?.id ?? null,
  );
  const [showCompleted, setShowCompleted] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    saveState(STORAGE_KEY, data);
  }, [data]);

  useEffect(() => {
    const timerId = window.setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => window.clearInterval(timerId);
  }, []);

  const selectedTask = data.tasks.find((task) => task.id === selectedId) ?? null;
  const visibleTasks = getVisibleTasks(data.tasks, showCompleted);
  const visibleCourseCount = new Set(visibleTasks.map((task) => task.course)).size;
  const counts = getTaskCounts(data.tasks, currentTime);

  const emptyMessage = showCompleted
    ? 'No academic tasks are available.'
    : 'No active assignments. Turn on "Show completed" to see finished tasks.';

  function handleAdvanceStatus(taskId) {
    const nextTasks = advanceTaskStatus(data.tasks, taskId);
    setData((current) => ({ ...current, tasks: nextTasks }));

    const updatedTask = nextTasks.find((task) => task.id === taskId);
    if (!showCompleted && updatedTask.status === 'DONE' && taskId === selectedId) {
      setSelectedId(getVisibleTasks(nextTasks, false)[0]?.id ?? null);
    }
  }

  function handleToggleCompleted() {
    const nextShowCompleted = !showCompleted;
    setShowCompleted(nextShowCompleted);

    if (!nextShowCompleted && selectedTask?.status === 'DONE') {
      setSelectedId(getVisibleTasks(data.tasks, false)[0]?.id ?? null);
    }
  }

  function handleReset() {
    const freshData = resetState(STORAGE_KEY, createSeedData);
    setData(freshData);
    setSelectedId(getVisibleTasks(freshData.tasks, showCompleted)[0]?.id ?? null);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">SDLC Starter App</p>
          <h1>Student Academic Work Coordination</h1>
          <p className="subtitle">
            Review example academic tasks and update their local progress status.
          </p>
        </div>
        <ResetControl onReset={handleReset} />
      </header>

      <p className="browser-note">Demo data is saved in this browser only.</p>

      <section className="overview-grid" aria-label="Overview">
        <article className="summary-card">
          <p className="summary-label">Total tasks</p>
          <p className="summary-value">{counts.total}</p>
        </article>
        <article className="summary-card">
          <p className="summary-label">In progress tasks</p>
          <p className="summary-value">{counts.inProgress}</p>
        </article>
        <article className="summary-card overdue-summary">
          <p className="summary-label">Overdue tasks</p>
          <p className="summary-value">{counts.overdue}</p>
        </article>
        <article className="summary-card">
          <p className="summary-label">Done tasks</p>
          <p className="summary-value">{counts.done}</p>
        </article>
      </section>

      <section className="content-grid">
        <section className="panel" aria-labelledby="task-list-heading">
          <div className="list-header">
            <div>
              <h2 id="task-list-heading">Academic Tasks</h2>
              <p className="list-note">
                {showCompleted
                  ? `${visibleTasks.length} assignments from ${visibleCourseCount} courses · nearest deadline first`
                  : `${visibleTasks.length} active assignments from ${visibleCourseCount} courses · nearest deadline first`}
              </p>
            </div>
            <label className="show-completed">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={handleToggleCompleted}
              />
              Show completed ({counts.done})
            </label>
          </div>
          <TaskList
            tasks={visibleTasks}
            selectedId={selectedId}
            onSelect={setSelectedId}
            emptyMessage={emptyMessage}
            currentTime={currentTime}
          />
        </section>
        <aside className="panel" aria-label="Selected task details">
          <TaskDetails
            task={selectedTask}
            onAdvanceStatus={handleAdvanceStatus}
            currentTime={currentTime}
          />
        </aside>
      </section>
    </main>
  );
}

import { useEffect, useState } from 'react';
import TaskDetails from './components/TaskDetails.jsx';
import TaskList from './components/TaskList.jsx';
import ResetControl from './components/ResetControl.jsx';
import { createSeedData } from './data/seed.js';
import { getTaskCounts, toggleTaskCompletion } from './utils/taskUtils.js';
import { loadState, resetState, saveState } from './utils/storage.js';

const STORAGE_KEY = 'sdlc:case-c:v1';

export default function App() {
  const [data, setData] = useState(() => loadState(STORAGE_KEY, createSeedData));
  const [selectedId, setSelectedId] = useState(() => data.tasks[0]?.id ?? null);

  useEffect(() => {
    saveState(STORAGE_KEY, data);
  }, [data]);

  const selectedTask = data.tasks.find((task) => task.id === selectedId) ?? null;
  const counts = getTaskCounts(data.tasks);

  function handleToggleCompletion(taskId) {
    setData((current) => ({
      ...current,
      tasks: toggleTaskCompletion(current.tasks, taskId),
    }));
  }

  function handleReset() {
    const freshData = resetState(STORAGE_KEY, createSeedData);
    setData(freshData);
    setSelectedId(freshData.tasks[0]?.id ?? null);
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
          <p className="summary-label">Done tasks</p>
          <p className="summary-value">{counts.done}</p>
        </article>
      </section>

      <section className="content-grid">
        <section className="panel" aria-labelledby="task-list-heading">
          <h2 id="task-list-heading">Academic Tasks</h2>
          <TaskList
            tasks={data.tasks}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </section>
        <aside className="panel" aria-label="Selected task details">
          <TaskDetails task={selectedTask} onToggleCompletion={handleToggleCompletion} />
        </aside>
      </section>
    </main>
  );
}

import { useEffect, useState } from 'react';
import TaskDetails from './components/TaskDetails.jsx';
import TaskList from './components/TaskList.jsx';
import ResetControl from './components/ResetControl.jsx';
import { createSeedData } from './data/seed.js';
import {
  advanceTaskStatus,
  getFilteredTasks,
  getTaskCounts,
} from './utils/taskUtils.js';
import { loadState, resetState, saveState } from './utils/storage.js';

const STORAGE_KEY = 'sdlc:case-c:v1';

export default function App() {
  const [data, setData] = useState(() => loadState(STORAGE_KEY, createSeedData));
  const [selectedId, setSelectedId] = useState(
    () => getFilteredTasks(data.tasks, { view: 'ACTIVE' })[0]?.id ?? null,
  );
  const [taskView, setTaskView] = useState('ACTIVE');
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    saveState(STORAGE_KEY, data);
  }, [data]);

  useEffect(() => {
    const timerId = window.setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => window.clearInterval(timerId);
  }, []);

  const selectedTask = data.tasks.find((task) => task.id === selectedId) ?? null;
  const courses = [...new Set(data.tasks.map((task) => task.course))].sort();
  const visibleTasks = getFilteredTasks(
    data.tasks,
    {
      view: taskView,
      query,
      type: typeFilter,
      course: courseFilter,
    },
    currentTime,
  );
  const visibleCourseCount = new Set(visibleTasks.map((task) => task.course)).size;
  const counts = getTaskCounts(data.tasks, currentTime);
  const viewCounts = {
    ACTIVE: counts.total - counts.done,
    COMPLETED: counts.done,
    ALL: counts.total,
  };

  const hasFilters = query || typeFilter !== 'ALL' || courseFilter !== 'ALL';
  const canClearFilters = hasFilters || taskView !== 'ACTIVE';
  const emptyMessage = hasFilters
    ? 'No tasks match your search or filters.'
    : taskView === 'COMPLETED'
      ? 'No completed tasks are available.'
      : taskView === 'ACTIVE'
        ? 'No active tasks are available.'
        : 'No academic tasks are available.';

  function handleAdvanceStatus(taskId) {
    const nextTasks = advanceTaskStatus(data.tasks, taskId);
    setData((current) => ({ ...current, tasks: nextTasks }));

    const updatedTask = nextTasks.find((task) => task.id === taskId);
    if (updatedTask.status === 'DONE' && taskId === selectedId) {
      const nextVisibleTasks = getFilteredTasks(nextTasks, {
        view: taskView,
        query,
        type: typeFilter,
        course: courseFilter,
      });
      setSelectedId(nextVisibleTasks[0]?.id ?? null);
    }
  }

  function handleTaskViewChange(nextView) {
    setTaskView(nextView);
    const nextVisibleTasks = getFilteredTasks(data.tasks, {
      view: nextView,
      query,
      type: typeFilter,
      course: courseFilter,
    });
    setSelectedId(nextVisibleTasks[0]?.id ?? null);
  }

  function handleClearFilters() {
    setQuery('');
    setTypeFilter('ALL');
    setCourseFilter('ALL');
    setTaskView('ACTIVE');
    setSelectedId(getFilteredTasks(data.tasks, { view: 'ACTIVE' })[0]?.id ?? null);
  }

  function handleReset() {
    const freshData = resetState(STORAGE_KEY, createSeedData);
    setData(freshData);
    setSelectedId(
      getFilteredTasks(freshData.tasks, {
        view: taskView,
        query,
        type: typeFilter,
        course: courseFilter,
      })[0]?.id ?? null,
    );
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
                {`${visibleTasks.length} ${taskView.toLowerCase()} assignments from ${visibleCourseCount} courses · nearest deadline first`}
              </p>
            </div>
            <div className="task-filters">
              <div className="task-tabs" role="tablist" aria-label="Task view">
                {[
                  ['ACTIVE', 'Active'],
                  ['COMPLETED', 'Completed'],
                  ['ALL', 'All tasks'],
                ].map(([value, label]) => (
                  <button
                    className={taskView === value ? 'task-tab active' : 'task-tab'}
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={taskView === value}
                    onClick={() => handleTaskViewChange(value)}
                  >
                    {label} <span className="tab-count">{viewCounts[value]}</span>
                  </button>
                ))}
              </div>
              <label className="search-field">
                <span className="sr-only">Search tasks</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search tasks..."
                />
              </label>
              <label>
                <span className="sr-only">Filter by type</span>
                <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                  <option value="ALL">All types</option>
                  <option value="GROUP">Group</option>
                  <option value="INDIVIDUAL">Individual</option>
                </select>
              </label>
              <label>
                <span className="sr-only">Filter by course</span>
                <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}>
                  <option value="ALL">All courses</option>
                  {courses.map((course) => <option key={course} value={course}>{course}</option>)}
                </select>
              </label>
              <button
                className="clear-filters"
                type="button"
                onClick={handleClearFilters}
                disabled={!canClearFilters}
              >
                Clear filters
              </button>
            </div>
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

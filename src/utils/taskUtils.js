export function sortTasksByDueDate(tasks) {
  return [...tasks].sort((a, b) =>
    `${a.dueDate}T${a.dueTime}`.localeCompare(`${b.dueDate}T${b.dueTime}`),
  );
}

export function isActiveTask(task) {
  return task.status !== 'DONE';
}

export function getTaskDeadline(task) {
  const [year, month, day] = task.dueDate.split('-').map(Number);
  const [hour, minute] = task.dueTime.split(':').map(Number);
  const deadline = new Date(year, month - 1, day, hour, minute);

  const hasValidParts = [year, month, day, hour, minute].every(Number.isFinite);
  const matchesInput =
    deadline.getFullYear() === year &&
    deadline.getMonth() === month - 1 &&
    deadline.getDate() === day &&
    deadline.getHours() === hour &&
    deadline.getMinutes() === minute;

  return hasValidParts && matchesInput ? deadline : null;
}

export function isOverdueTask(task, now = new Date()) {
  if (!isActiveTask(task)) return false;

  const deadline = getTaskDeadline(task);
  const comparisonTime = now instanceof Date ? now : new Date(now);

  return Boolean(
    deadline &&
      Number.isFinite(comparisonTime.getTime()) &&
      comparisonTime.getTime() > deadline.getTime(),
  );
}

export function getVisibleTasks(tasks, showCompleted) {
  const sortedTasks = sortTasksByDueDate(tasks);
  return showCompleted ? sortedTasks : sortedTasks.filter(isActiveTask);
}

export function getFilteredTasks(
  tasks,
  { query = '', view = 'ACTIVE', status = 'ALL', type = 'ALL', course = 'ALL' } = {},
  now = new Date(),
) {
  const normalizedQuery = query.trim().toLowerCase();
  const visibleTasks = sortTasksByDueDate(tasks).filter((task) => {
    if (view === 'COMPLETED') return task.status === 'DONE';
    if (view === 'ACTIVE') return task.status !== 'DONE';
    return true;
  });

  return visibleTasks.filter((task) => {
    const matchesQuery =
      !normalizedQuery ||
      [task.id, task.title, task.course].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );
    const matchesStatus =
      status === 'ALL' ||
      (status === 'OVERDUE' ? isOverdueTask(task, now) : task.status === status);
    const matchesType = type === 'ALL' || task.type === type;
    const matchesCourse = course === 'ALL' || task.course === course;

    return matchesQuery && matchesStatus && matchesType && matchesCourse;
  });
}

export function getTaskCounts(tasks, now = new Date()) {
  return {
    total: tasks.length,
    inProgress: tasks.filter((task) => task.status === 'IN_PROGRESS').length,
    done: tasks.filter((task) => task.status === 'DONE').length,
    overdue: tasks.filter((task) => isOverdueTask(task, now)).length,
  };
}

const nextStatus = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: 'TODO',
};

export function advanceTaskStatus(tasks, taskId) {
  return tasks.map((task) => {
    if (task.id !== taskId) return task;

    return {
      ...task,
      status: nextStatus[task.status] ?? task.status,
    };
  });
}

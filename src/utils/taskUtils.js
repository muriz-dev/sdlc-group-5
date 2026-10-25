export function sortTasksByDueDate(tasks) {
  return [...tasks].sort((a, b) =>
    `${a.dueDate}T${a.dueTime}`.localeCompare(`${b.dueDate}T${b.dueTime}`),
  );
}

export function isActiveTask(task) {
  return task.status !== 'DONE';
}

export function getVisibleTasks(tasks, showCompleted) {
  const sortedTasks = sortTasksByDueDate(tasks);
  return showCompleted ? sortedTasks : sortedTasks.filter(isActiveTask);
}

export function getTaskCounts(tasks) {
  return {
    total: tasks.length,
    inProgress: tasks.filter((task) => task.status === 'IN_PROGRESS').length,
    done: tasks.filter((task) => task.status === 'DONE').length,
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

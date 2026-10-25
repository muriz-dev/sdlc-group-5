export function sortTasksByDueDate(tasks) {
  return [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function getTaskCounts(tasks) {
  return {
    total: tasks.length,
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

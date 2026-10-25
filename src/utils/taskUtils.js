export function getTaskCounts(tasks) {
  return {
    total: tasks.length,
    done: tasks.filter((task) => task.status === 'DONE').length,
  };
}

export function toggleTaskCompletion(tasks, taskId) {
  return tasks.map((task) => {
    if (task.id !== taskId) return task;

    return {
      ...task,
      status: task.status === 'DONE' ? 'TODO' : 'DONE',
    };
  });
}

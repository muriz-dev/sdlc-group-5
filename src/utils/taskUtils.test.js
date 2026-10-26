import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getTaskCounts,
  getVisibleTasks,
  isOverdueTask,
} from './taskUtils.js';

const task = {
  id: 'TASK-TEST',
  course: 'Software Engineering',
  dueDate: '2026-10-20',
  dueTime: '10:00',
  status: 'TODO',
};

test('unfinished task becomes overdue only after its deadline', () => {
  assert.equal(isOverdueTask(task, new Date(2026, 9, 20, 9, 59)), false);
  assert.equal(isOverdueTask(task, new Date(2026, 9, 20, 10, 0)), false);
  assert.equal(isOverdueTask(task, new Date(2026, 9, 20, 10, 1)), true);
});

test('completed task is not reported as overdue', () => {
  const completedTask = { ...task, status: 'DONE' };
  assert.equal(isOverdueTask(completedTask, new Date(2026, 9, 21, 10, 0)), false);
});

test('overdue unfinished task remains in the active task list', () => {
  const visibleTasks = getVisibleTasks(
    [task, { ...task, id: 'TASK-DONE', status: 'DONE' }],
    false,
  );

  assert.deepEqual(visibleTasks.map(({ id }) => id), ['TASK-TEST']);
});

test('task counts include overdue unfinished assignments', () => {
  const now = new Date(2026, 9, 21, 10, 0);
  const tasks = [
    task,
    { ...task, id: 'TASK-IN-PROGRESS', status: 'IN_PROGRESS' },
    { ...task, id: 'TASK-DONE', status: 'DONE' },
  ];

  assert.deepEqual(getTaskCounts(tasks, now), {
    total: 3,
    inProgress: 1,
    done: 1,
    overdue: 2,
  });
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getFilteredTasks,
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

  test('task filters search across task id, title, and course', () => {
    const tasks = [
      { ...task, title: 'Prepare slides' },
      { ...task, id: 'TASK-OTHER', title: 'Review notes', course: 'Database Systems' },
    ];

    assert.deepEqual(
      getFilteredTasks(tasks, { query: 'database' }).map(({ id }) => id),
      ['TASK-OTHER'],
    );
  });

  test('task filters combine status and type', () => {
    const tasks = [
      { ...task, type: 'GROUP', status: 'TODO' },
      { ...task, id: 'TASK-INDIVIDUAL', type: 'INDIVIDUAL', status: 'TODO' },
    ];

    assert.deepEqual(
      getFilteredTasks(tasks, { type: 'INDIVIDUAL', status: 'TODO' }).map(({ id }) => id),
      ['TASK-INDIVIDUAL'],
    );
  });

  test('all tasks view includes completed tasks', () => {
    const tasks = [
      { ...task, status: 'TODO' },
      { ...task, id: 'TASK-DONE', status: 'DONE' },
    ];

    assert.deepEqual(
      getFilteredTasks(tasks, { view: 'ALL' }).map(({ id }) => id),
      ['TASK-TEST', 'TASK-DONE'],
    );
  });

  test('active view hides completed tasks and completed view shows them', () => {
    const tasks = [
      { ...task, status: 'TODO' },
      { ...task, id: 'TASK-DONE', status: 'DONE' },
    ];

    assert.deepEqual(
      getFilteredTasks(tasks, { view: 'ACTIVE' }).map(({ id }) => id),
      ['TASK-TEST'],
    );
    assert.deepEqual(
      getFilteredTasks(tasks, { view: 'COMPLETED' }).map(({ id }) => id),
      ['TASK-DONE'],
    );
  });
});

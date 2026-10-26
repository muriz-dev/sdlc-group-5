import TaskCard from './TaskCard.jsx';

export default function TaskList({
  tasks,
  selectedId,
  onSelect,
  emptyMessage = 'No academic tasks are available.',
  currentTime,
}) {
  if (tasks.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  return (
    <ul className="record-list" aria-label="Academic tasks">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard
            task={task}
            isSelected={task.id === selectedId}
            onSelect={onSelect}
            currentTime={currentTime}
          />
        </li>
      ))}
    </ul>
  );
}

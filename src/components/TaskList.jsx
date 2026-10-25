import TaskCard from './TaskCard.jsx';

export default function TaskList({ tasks, selectedId, onSelect }) {
  if (tasks.length === 0) {
    return <div className="empty-state">No academic tasks are available.</div>;
  }

  return (
    <ul className="record-list" aria-label="Academic tasks">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard
            task={task}
            isSelected={task.id === selectedId}
            onSelect={onSelect}
          />
        </li>
      ))}
    </ul>
  );
}

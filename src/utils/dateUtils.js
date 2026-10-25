const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function formatDeadlineDate(dueDate) {
  const [year, month, day] = dueDate.split('-');
  return `${Number(day)} ${monthLabels[Number(month) - 1]} ${year}`;
}

export function formatDeadline(dueDate, dueTime) {
  return `${formatDeadlineDate(dueDate)} · ${dueTime}`;
}

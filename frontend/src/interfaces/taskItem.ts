export interface Task {
  _id: string;
  title: string;
  description: string;
  dueDate: string;
  category: string;
  isCompleted: boolean;
}

export interface TaskItemProps {
  task: Task;
  tooltipVisible: boolean;
  onToggleTooltip: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
}
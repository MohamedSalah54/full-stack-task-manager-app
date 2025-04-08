export interface Task {
    _id: string;
    title: string;
    description: string;
    dueDate: string;
    category: string;
    completed: boolean;
  }
export interface TaskListProps {
  tasks: Task[];
  tooltipVisibleId: string | null;
  setTooltipVisible: (id: string | null) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onToggleComplete: (task: Task) => void;
}
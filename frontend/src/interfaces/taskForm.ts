export interface TaskFormData {
    title: string;
    description: string;
    dueDate: string;
    category: string;
  }
  
  export interface TaskFormProps {
    taskData: TaskFormData;
    isEditing?: boolean;
    onChange: (field: keyof TaskFormData, value: string) => void;
    onCancel: () => void;
    onSubmit: () => void;
    options: { name: string; icon: string }[];
  }
  
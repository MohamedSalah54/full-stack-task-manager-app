
export interface Task {
    _id: string;
    title: string;
    description: string;
    dueDate: string;
    category: string;
    isCompleted: boolean;
    id?: string;
  }
  
  export interface TaskCreateData {
    title: string;
    description: string;
    dueDate: string;
    category: string;
  }
  
  export interface TaskUpdateData {
    title?: string;
    description?: string;
    dueDate?: string;
    category?: string;
    isCompleted?: boolean;
  }
  
import { ReactNode } from "react";

export interface Task {
    assignedTo: ReactNode;
    _id: string;
    title: string;
    description: string;
    dueDate: string;
    category?: string;
    completed: boolean;
    id?: string;
  }
  
  export interface TaskCreateData {
    title: string;
    description: string;
    dueDate: string;
    category?: string;
    assignedTo?: string;
  }
  
  export interface TaskUpdateData {
    title?: string;
    description?: string;
    dueDate?: string;
    category?: string;
    completed?: boolean;
  }
  
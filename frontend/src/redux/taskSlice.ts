// في ملف slices/tasksSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '@/interfaces/taskList';

interface TasksState {
  tasks: Task[];
}

const initialState: TasksState = {
  tasks: [],
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks(state, action: PayloadAction<Task[]>) {
      state.tasks = action.payload;
    },
    addTask(state, action: PayloadAction<Task>) {
      state.tasks.push(action.payload);
    },
    updateTask(state, action: PayloadAction<Task>) {
      const index = state.tasks.findIndex(task => task._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter(task => task._id !== action.payload);
    },
    toggleComplete(state, action: PayloadAction<string>) {
      const index = state.tasks.findIndex(task => task._id === action.payload);
      if (index !== -1) {
        state.tasks[index].completed = !state.tasks[index].completed;
      }
    },
  },
});

export const { setTasks, addTask, updateTask, deleteTask, toggleComplete } = tasksSlice.actions;
export default tasksSlice.reducer;

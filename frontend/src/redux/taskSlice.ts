import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '@/interfaces/task';
import { fetchTasksTeam as fetchTasksAPI,  fetchAllTasksForTeamLead as fetchAllTasksAPI, getAllTasks } from '@/lib/tasks';  
import { createTaskForSelf } from '@/lib/tasks'; // استورد الدالة هنا

// إضافة دالة createTaskForSelf الجديدة
export const createTask = createAsyncThunk(
  'tasks/createTaskForSelf',
  async (taskData: any, { rejectWithValue }) => {
    try {
      const task = await createTaskForSelf(taskData); // استدعاء دالة axios هنا
      return task;  // رجع المهمة المنشأة
    } catch (error) {
      return rejectWithValue(error); // رجع الخطأ لو حصل
    }
  }
);

export const fetchAllTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await getAllTasks();
      return tasks;  // رجع المهام
    } catch (err: any) {
      return rejectWithValue(err.message);  // لو حصل خطأ رجع رسالة الخطأ
    }
  }
);

export const fetchTasksTeam = createAsyncThunk<Task[], void>(
  'tasks/fetchTasksTeam',
  async (_, thunkAPI) => {
    try {
      const tasks = await fetchTasksAPI(); 
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch tasks");
    }
  }
);

export const fetchAllTasksForTeamLead = createAsyncThunk<Task[], string>(
  'tasks/fetchAllTasksForTeamLead',
  async (teamId, thunkAPI) => {
    try {
      const tasks = await fetchAllTasksAPI(teamId); 
      return tasks;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch all team tasks");
    }
  }
);

export const fetchTasksWithTeamNameAndStatus = createAsyncThunk<any[], void>(
  'tasks/fetchTasksWithTeamNameAndStatus',
  async (_, { rejectWithValue }) => {
    try {
      const tasks = await fetchTasksAPI(); // Call the API function
      return tasks;  // Return the fetched tasks
    } catch (err: any) {
      return rejectWithValue(err.message);  // Handle errors
    }
  }
);

interface TasksState {
  tasks: Task[];
  status: string; 
}

const initialState: TasksState = {
  tasks: [],
  status: 'idle',
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
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksTeam.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasksTeam.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(fetchTasksTeam.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(fetchAllTasksForTeamLead.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAllTasksForTeamLead.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(fetchAllTasksForTeamLead.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(fetchAllTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTask.pending, (state) => {
        state.status = 'loading'; // أثناء التحميل
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.status = 'succeeded'; // عند النجاح
        state.tasks.push(action.payload); // إضافة المهمة
      })
      .addCase(createTask.rejected, (state, action) => {
        state.status = 'failed'; // عند الفشل
        state.error = action.payload; // حفظ الخطأ
      })
      .addCase(fetchTasksWithTeamNameAndStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasksWithTeamNameAndStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.tasks = action.payload;
      })
      .addCase(fetchTasksWithTeamNameAndStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setTasks, addTask, updateTask, deleteTask, toggleComplete } = tasksSlice.actions;
export default tasksSlice.reducer;

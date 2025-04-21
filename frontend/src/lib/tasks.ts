import API from "./api";
import toast from "react-hot-toast";
import { Task, TaskCreateData, TaskUpdateData } from '@/interfaces/task';

export const getTasks = async (category: string = "all"): Promise<Task[]> => {
  try {
    const normalizedCategory = category.toLowerCase();
    const endpoint = normalizedCategory === "all" ? "/tasks" : `/tasks?category=${normalizedCategory}`;
    const response = await API.get(endpoint, { withCredentials: true });  // إضافة withCredentials هنا
    const tasks: Task[] = response.data.map((task: Task) => ({
      ...task,
      id: task._id,
    }));
    return tasks;
  } catch (error) {
    toast.error("Something went wrong");
    return [];
  }
};

export const createTask = async (taskData: TaskCreateData, creatorId: string): Promise<Task> => {
  try {

    const newTaskData = {
      ...taskData,
      ...(taskData.category ? { category: taskData.category.toLowerCase() } : {}), 
      assignedTo: taskData.assignedTo || creatorId,
    };

    const response = await API.post("/tasks", newTaskData, {
      withCredentials: true,  
    });

    if (!response.data || !response.data._id) {
      throw new Error("Failed to get task ID from response");
    }

    return response.data;
  } catch (error: any) {
    toast.error("Failed to Create Task");
    throw error;
  }
};

export const fetchTasksTeam = async (): Promise<Task[]> => {
  try {
    const response = await API.get(`/tasks`, {
      withCredentials: true,
    });

    if (!response.data) {
      throw new Error("Failed to fetch tasks");
    }

    return response.data; 
  } catch (error: any) {
    toast.error("Failed to fetch tasks");
    throw error;
  }
}

export const fetchAllTasksForTeamLead = async (teamId) => {
  try {
    const { data } = await API.get(`/tasks/team/all`, {
      params: { teamId },
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Error fetching team tasks:", error);
    throw error;
  }
};



export const toggleTaskComplete = async (id: string): Promise<Task> => {
  try {
    const response = await API.patch(`/tasks/${id}/toggle-complete`, {}, { withCredentials: true }); 
    return response.data;
  } catch (error) {
    toast.error("Failed to toggle task status");
    throw error;
  }
};

export const updateTask = async (_id: string, updatedData: TaskUpdateData): Promise<Task> => {
  try {
    const response = await API.patch(`/tasks/${_id}`, updatedData, { withCredentials: true });  
    return response.data;
  } catch (error: any) {
    toast.error("Failed to Update Task");
    throw error;
  }
};

export const deleteTask = async (_id: string): Promise<any> => {
  try {
    const response = await API.delete(`/tasks/${_id}`, { withCredentials: true }); 
    return response.data;
  } catch (error) {
    toast.error("Failed to Delete Task");
    throw error;
  }
};

import { toggleTaskComplete } from "../lib/tasks";  
import { updateTask } from "../redux/taskSlice"; 
import { toast } from "react-hot-toast";

export const toggleComplete = (taskId: string) => async (dispatch: any) => {
  try {
    const updatedTask = await toggleTaskComplete(taskId);
    dispatch(updateTask(updatedTask)); 

  } catch (error) {
    toast.error("Something went wrong while toggling task status");
  }
};

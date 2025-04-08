// في ملف actions/tasksActions.ts أو thunks.ts
import { toggleTaskComplete } from "../lib/tasks";  
import { updateTask } from "../redux/taskSlice"; 

export const toggleComplete = (taskId: string) => async (dispatch: any) => {
  try {
    const updatedTask = await toggleTaskComplete(taskId);
    dispatch(updateTask(updatedTask)); 
  } catch (error) {
    console.log(error);
    
  }
};

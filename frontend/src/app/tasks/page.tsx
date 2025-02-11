'use client';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import {
  getTasks as getTasksAPI,
  createTask as createTaskAPI,
  updateTask as updateTaskAPI,
  deleteTask as deleteTaskAPI,
} from '../../lib/tasks';
import {
  setTasks,
  addTask as addTaskAction,
  updateTask as updateTaskAction,
  deleteTask as deleteTaskAction,
  toggleComplete as toggleCompleteAction,
} from '../../redux/taskSlice';
import toast from 'react-hot-toast';
import CategoryFilter from '../../components/CategoryFilter';
import Dashboard from '../../components/Dashboard';
import TaskForm from '@/components/TaskForm';
import TaskList from '../../components/TaskList';
import DeleteModal from '../../components/DeleteModal';
import Loader from '@/loader/Loader';
import { TaskFormData } from '@/interfaces/taskForm';
import { Task } from '@/interfaces/task';
import useAuth from '../../hooks/useAuth';

export default function TasksPage() {
  const isAuthChecked = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const tasks = useSelector((state: RootState) => state.tasks.tasks);

  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [tooltipVisibleId, setTooltipVisibleId] = useState<string | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskFormData, setTaskFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    dueDate: '',
    category: 'work',
  });

  const categories = ['all', 'work', 'personal', 'shopping'];
  const options = [
    { name: 'Work', icon: '📂' },
    { name: 'Personal', icon: '🏡' },
    { name: 'Shopping', icon: '🛒' },
  ];

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const fetchedTasks = await getTasksAPI(selectedCategory);
        dispatch(setTasks(fetchedTasks));
      } catch (error) {
        toast.error('Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [selectedCategory, dispatch]);

  const handleFormChange = (field: keyof TaskFormData, value: string) => {
    setTaskFormData({ ...taskFormData, [field]: value });
  };

  const addTask = async () => {
    try {
      const newTaskData = await createTaskAPI(taskFormData);
      if (newTaskData._id) {
        dispatch(addTaskAction(newTaskData));
        toast.success('Task created');
        setShowForm(false);
        setTaskFormData({ title: '', description: '', dueDate: '', category: 'work' });
      } else {
        toast.error('Failed to get task ID');
      }
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const saveEditTask = async () => {
    if (!taskToEdit) return;
    try {
      const updatedTask = await updateTaskAPI(taskToEdit._id, {
        title: taskFormData.title,
        description: taskFormData.description,
        dueDate: taskFormData.dueDate,
        category: taskFormData.category,
      });
      dispatch(updateTaskAction(updatedTask));
      toast.success('Task updated successfully!');
      setShowForm(false);
      setTaskToEdit(null);
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const deleteTaskHandler = async (id: string) => {
    try {
      await deleteTaskAPI(id);
      dispatch(deleteTaskAction(id));
      toast.success('Task Deleted Successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed To Delete Task');
    } finally {
      setIsDeleteModalVisible(false);
      setTaskToDelete(null);
    }
  };

  const toggleComplete = (task: Task) => {
    dispatch(toggleCompleteAction(task._id));
    if (task.isCompleted) {
      toast.success('Task marked as incomplete!');
    } else {
      toast.success('Task marked as completed!');
    }
  };

  const filteredTasks =
    selectedCategory === 'all'
      ? tasks
      : tasks.filter((task) => task.category === selectedCategory);

  return (
    <>
      {(!isAuthChecked || loading) ? (
        <Loader />
      ) : (
        <div className="min-h-screen bg-gray-100 p-8 relative">
          <h1 className="text-3xl font-bold text-center mb-8">
            What do you need to get done today?
          </h1>

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <Dashboard />

          {tasks.length === 0 ? (
            <div className="absolute top-[80%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center space-y-2 
                  max-[680px]:top-10 max-[680px]:right-4 max-[680px]:left-auto max-[680px]:-translate-x-0 max-[680px]:-translate-y-0">
              <button
                className="w-12 h-12 bg-blue-600 text-white text-3xl font-bold rounded-full flex items-center justify-center hover:bg-blue-700"
                onClick={() => {
                  setShowForm(true);
                  setTaskToEdit(null);
                  setTaskFormData({ title: '', description: '', dueDate: '', category: 'work' });
                }}
              >
                +
              </button>
              <span className="text-xl font-semibold max-[680px]:hidden">
                Add Task
              </span>
            </div>
          ) : (
            <div className="absolute top-4 right-4">
              <button
                className="w-12 h-12 bg-blue-600 text-white text-3xl font-bold rounded-full flex items-center justify-center hover:bg-blue-700"
                onClick={() => {
                  setShowForm(true);
                  setTaskToEdit(null);
                  setTaskFormData({ title: '', description: '', dueDate: '', category: 'work' });
                }}
              >
                +
              </button>
            </div>
          )}



          {showForm && (
            <TaskForm
              taskData={taskFormData}
              isEditing={!!taskToEdit}
              onChange={handleFormChange}
              onCancel={() => setShowForm(false)}
              onSubmit={taskToEdit ? saveEditTask : addTask}
              options={options}
            />
          )}

          <TaskList
            tasks={filteredTasks}
            tooltipVisibleId={tooltipVisibleId}
            setTooltipVisible={setTooltipVisibleId}
            onEditTask={(task) => {
              setTaskToEdit(task);
              setTaskFormData({
                title: task.title,
                description: task.description,
                dueDate: task.dueDate,
                category: task.category,
              });
              setShowForm(true);
              setTooltipVisibleId(null);
            }}
            onDeleteTask={(id) => {
              setTaskToDelete(id);
              setIsDeleteModalVisible(true);
              setTooltipVisibleId(null);
            }}
            onToggleComplete={(task) => {
              toggleComplete(task);
              setTooltipVisibleId(null);
            }}
          />

          {isDeleteModalVisible && taskToDelete && (
            <DeleteModal
              onCancel={() => setIsDeleteModalVisible(false)}
              onConfirm={() => deleteTaskHandler(taskToDelete)}
            />
          )}
        </div>
      )}
    </>
  );
}

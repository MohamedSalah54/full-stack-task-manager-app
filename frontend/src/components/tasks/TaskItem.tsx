'use client';
import React, { useState, useEffect } from 'react';
import { TaskItemProps } from '@/interfaces/taskItem';
import { FaEllipsisV, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { toggleComplete } from '@/redux/tasksActions';
import { toast } from 'react-hot-toast';
import { useAppSelector } from '@/hooks/redux';
import { RootState } from '@/redux/store';

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  tooltipVisible,
  onToggleTooltip,
  onEdit,
  onDelete,
}) => {
  const [currentTask, setCurrentTask] = useState(task);
  const dispatch = useDispatch();
  const currentUser = useAppSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    setCurrentTask(task);
  }, [task]);

  const handleToggleComplete = () => {
    dispatch(toggleComplete(task._id));
    setCurrentTask(prevTask => ({
      ...prevTask,
      completed: !prevTask.completed,
    }));

    toast.success(`Task marked as ${currentTask.completed ? 'incomplete' : 'complete'}`);

    onToggleTooltip();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg relative">
      <button onClick={onToggleTooltip} className="absolute top-2 right-2 text-gray-600">
        <FaEllipsisV />
      </button>

      {tooltipVisible && (
        <div className="absolute top-8 right-2 bg-white shadow-md p-2 rounded-md space-y-2 w-40">
          {currentUser.role !== 'user' && (
            <>
              <button
                onClick={onEdit}
                className="flex items-center text-blue-600 hover:bg-gray-100 px-3 py-2 w-full text-left rounded"
              >
                <FaEdit className="mr-2" /> Update
              </button>

              <button
                onClick={onDelete}
                className="flex items-center text-red-600 hover:bg-gray-100 px-3 py-2 w-full text-left rounded"
              >
                <FaTrash className="mr-2" /> Delete
              </button>
            </>
          )}


          <button
            onClick={handleToggleComplete}
            className={`flex items-center hover:bg-gray-100 px-3 py-2 w-full text-left rounded ${currentTask.completed ? 'text-red-600' : 'text-green-600'
              }`}
          >
            {currentTask.completed ? (
              <>
                <FaTimesCircle className="mr-2" /> Incomplete
              </>
            ) : (
              <>
                <FaCheckCircle className="mr-2" /> Complete
              </>
            )}
          </button>
        </div>
      )}

      <div
        className={`absolute top-2 left-2 w-3 h-3 ${currentTask.completed ? 'bg-green-500' : 'bg-red-500'
          } rounded-full`}
      ></div>

      <h3 className="text-xl font-semibold">{currentTask.title}</h3>
      <p className="text-gray-500">{currentTask.category}</p>
      <p className="text-gray-500">{currentTask.description}</p>
      <p className="text-gray-400">Due: {new Date(currentTask.dueDate).toLocaleDateString()}</p>
    </div>
  );
};

export default TaskItem;

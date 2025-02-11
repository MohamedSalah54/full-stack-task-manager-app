'use client';
import React from 'react';
import { FaEllipsisV, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import {TaskItemProps} from '@/interfaces/taskItem'

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  tooltipVisible,
  onToggleTooltip,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg relative">
      <button onClick={onToggleTooltip} className="absolute top-2 right-2 text-gray-600">
        <FaEllipsisV />
      </button>

      {tooltipVisible && (
        <div className="absolute top-8 right-2 bg-white shadow-md p-2 rounded-md space-y-2 w-40">
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

          <button
            onClick={onToggleComplete}
            className={`flex items-center hover:bg-gray-100 px-3 py-2 w-full text-left rounded ${
              task.isCompleted ? 'text-red-600' : 'text-green-600'
            }`}
          >
            {task.isCompleted ? (
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
        className={`absolute top-2 left-2 w-3 h-3 ${
          task.isCompleted ? 'bg-green-500' : 'bg-red-500'
        } rounded-full`}
      ></div>
      <h3 className="text-xl font-semibold">{task.title}</h3>
      <p className="text-gray-500">{task.category}</p>
      <p className="text-gray-500">{task.description}</p>
      <p className="text-gray-400">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
    </div>
  );
};

export default TaskItem;

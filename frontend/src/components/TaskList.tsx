'use client';
import React from 'react';
import {TaskListProps}from "@/interfaces/taskList";
import TaskItem from './TaskItem';



const TaskList: React.FC<TaskListProps> = ({
  tasks,
  tooltipVisibleId,
  setTooltipVisible,
  onEditTask,
  onDeleteTask,
  onToggleComplete,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
      {tasks.map((task, index) => (
        <TaskItem
          key={task._id || index}
          task={task}
          tooltipVisible={tooltipVisibleId === task._id}
          onToggleTooltip={() =>
            setTooltipVisible(tooltipVisibleId === task._id ? null : task._id)
          }
          onEdit={() => onEditTask(task)}
          onDelete={() => onDeleteTask(task._id)}
          onToggleComplete={() => onToggleComplete(task)}
        />
      ))}
    </div>
  );
};

export default TaskList;

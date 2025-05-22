'use client';

import { useAppSelector } from '@/hooks/redux';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { Typography, Box } from '@mui/material';

const TaskTimeline = () => {
  const tasks = useAppSelector((state) => state.tasks.tasks);

  const upcomingTasks = tasks
    .filter((task) => task.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div>
      <Box display="flex" justifyContent="center" mb={2}>
        <Typography variant="h6">Upcoming Deadlines</Typography>
      </Box>

      <Timeline>
        {upcomingTasks.map((task) => (
          <TimelineItem key={task._id}>
            <TimelineSeparator>
              <TimelineDot color={task.completed ? 'primary' : 'warning'} />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="body1">{task.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(task.dueDate).toLocaleDateString()}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
};

export default TaskTimeline;

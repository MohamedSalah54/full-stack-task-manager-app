'use client';

import { BarChart } from '@mui/x-charts/BarChart';
import { useAppSelector } from '@/hooks/redux';

const TeamPerformanceChart = () => {
  const tasks = useAppSelector((state) => state.tasks.tasks);
  console.log("Tasks:", tasks); 

  const team = useAppSelector((state) => state.teams.teams[0]);

  if (!team) return <div>Team not found</div>;

  const memberStats = team?.members?.map((member) => {
    const memberTasks = tasks.filter((task) => {
      if (task.assignedTo && task.assignedTo.email) {
        return task.assignedTo.email === member.email;
      }
      return false;
    });

    const completed = memberTasks.filter((task) => task.completed).length;
    const notCompleted = memberTasks.length - completed; 

    return {
      name: member.name,
      completed,
      notCompleted, 
    };
  });

  return (
    <BarChart
      xAxis={[{ scaleType: 'band', data: memberStats?.map((m) => m.name) || [] }]}

      series={[
        {
          name: 'Completed',
          data: memberStats?.map((m) => m.completed) || [],
          color: 'blue', 
        },
        {
          name: 'Not Completed',
          data: memberStats?.map((m) => m.notCompleted) || [],
          color: 'orange',
        },
      ]}
      width={600}
      height={300}
    />
  );
};

export default TeamPerformanceChart;

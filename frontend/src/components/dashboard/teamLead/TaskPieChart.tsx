// components/TaskPieChart.tsx

'use client';

import { PieChart } from '@mui/x-charts/PieChart';
import { useAppSelector } from '@/hooks/redux';

const TaskPieChart = () => {
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const completed = tasks.filter((task) => task.completed).length;
  const incomplete = tasks.length - completed;

  return (
    <PieChart
      series={[
        {
          data: [
            { id: 0, value: completed, label: 'Completed' },
            { id: 1, value: incomplete, label: 'Incomplete' },
          ],
        },
      ]}
      width={400}
      height={200}
    />
  );
};

export default TaskPieChart;

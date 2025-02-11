'use client';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { RootState } from '../redux/store';

const Dashboard = () => {
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const pendingTasks = tasks.filter(task => !task.isCompleted).length;

  const getCircleClass = (count: number, type: 'total' | 'completed' | 'pending') => {
    let baseClass = 'flex items-center justify-center rounded-full text-white font-bold';
    let sizeClass = count > 9 ? 'text-3xl' : 'text-2xl';
    let colorClass = '';
    if (type === 'total') {
      colorClass = 'bg-blue-600';
    } else if (type === 'completed') {
      colorClass = 'bg-green-600';
    } else if (type === 'pending') {
      colorClass = 'bg-red-600';
    }
    return `${baseClass} ${sizeClass} ${colorClass} w-[60px] h-[60px]`;
  };

  return (
    <section className="w-full flex flex-col items-center text-center px-6 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
        <Link href="/tasks">
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-between h-full">
            <div className="mb-4">
              <div className={getCircleClass(totalTasks, 'total')}>
                {totalTasks}
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-4">Total Tasks</h3>
          </div>
        </Link>

        <Link href="/tasks">
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-between h-full">
            <div className="mb-4">
              <div className={getCircleClass(completedTasks, 'completed')}>
                {completedTasks}
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-4">Completed Tasks</h3>
          </div>
        </Link>

        <Link href="/tasks">
          <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-between h-full">
            <div className="mb-4">
              <div className={getCircleClass(pendingTasks, 'pending')}>
                {pendingTasks}
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-4">Pending Tasks</h3>
          </div>
        </Link>
      </div>
    </section>
  );
};

export default Dashboard;

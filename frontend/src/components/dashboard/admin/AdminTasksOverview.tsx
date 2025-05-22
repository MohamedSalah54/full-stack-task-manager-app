'use client';

import { Box, Typography, CircularProgress, Avatar } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useEffect, useState } from 'react';
import { fetchAllTasks } from '@/redux/taskSlice';
import Loader from '@/loader/Loader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const dashboardColors = {
  completed: '#4caf50',
  notCompleted: '#f44336',
  totalTasks: '#2196f3',
  default: '#9e9e9e',
};

const AdminTaskOverview = () => {
  const dispatch = useAppDispatch();
  const { tasks, loading } = useAppSelector((state) => state.tasks);

  const { user: users, loading: userLoading, error } = useAppSelector((state) => state.createUser);

  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    dispatch(fetchAllTasks());
  }, [dispatch]);

  useEffect(() => {
    if (users && users.length > 0) {
      const imagePromises = users.map(user => {
        if (user.image) {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = getImageUrl(user.image);
            img.onload = () => resolve(true);
            img.onerror = () => reject(false);
          });
        }
        return Promise.resolve(true);
      });

      Promise.all(imagePromises)
        .then(() => setImageLoaded(true))
        .catch(() => setImageLoaded(true));
    }
  }, [users]);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const incompleteTasks = tasks.length - completedTasks;

  const memberStats: Record<string, { completed: number; incomplete: number; image?: string }> = {};

  tasks.forEach((task) => {
    const member = task.assignedTo?.name || 'Unknown';
    const image = users?.find(user => user.name === member)?.image;

    if (!memberStats[member]) {
      memberStats[member] = { completed: 0, incomplete: 0, image };
    }

    if (task.completed) memberStats[member].completed += 1;
    else memberStats[member].incomplete += 1;
  });

  const sortedCompleted = Object.entries(memberStats)
    .filter(([, data]) => data.completed > 0)
    .map(([member, data]) => ({ member, ...data }))
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 3);

  const sortedIncomplete = Object.entries(memberStats)
    .map(([member, data]) => ({ member, ...data }))
    .sort((a, b) => b.incomplete - a.incomplete)
    .slice(0, 3);

  const stats = [
    { label: 'Total Tasks', value: tasks.length },
    { label: 'Completed Tasks', value: completedTasks },
    { label: 'Incomplete Tasks', value: incompleteTasks },
  ];

  const getProgress = (label: string) => {
    if (label === 'Completed Tasks') return (completedTasks / tasks.length) * 100 || 0;
    if (label === 'Incomplete Tasks') return (incompleteTasks / tasks.length) * 100 || 0;
    return 100;
  };

  const getColor = (label: string) => {
    if (label === 'Completed Tasks') return dashboardColors.completed;
    if (label === 'Incomplete Tasks') return dashboardColors.notCompleted;
    if (label === 'Total Tasks') return dashboardColors.totalTasks;
    return dashboardColors.default;
  };

  const getImageUrl = (image: string) => {
    if (!image) {
      return "http://localhost:3001/static/default-avatar.png";
    }

    const baseUrl = "http://localhost:3001";
    const imageUrl = image.startsWith("http")
      ? image.replace(/\\/g, "/")
      : `${baseUrl}/static/${image}`.replace(/\\/g, "/");

    return imageUrl;
  };

  return (
    <Box p={4}>
    {loading || !imageLoaded ? (
      <div> <Loader /></div>
    ) : (
      <>
        <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
          {/* الدوائر على اليسار */}
          <div className="flex flex-wrap gap-10 md:w-2/3 justify-center">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`min-w-[200px] flex justify-center items-center h-[160px] ${index >= 2 ? 'w-full md:w-[200px]' : 'w-full md:w-[200px]'}`}
              >
                <div className="relative w-[160px] h-[160px] flex items-center justify-center">
                  <CircularProgress
                    variant="determinate"
                    value={getProgress(stat.label)}
                    size={160}
                    thickness={5}
                    sx={{ color: getColor(stat.label) }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
            <Box className="bg-white p-4 rounded-lg shadow-md mt-10 w-full md:w-[800px]">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={[...sortedCompleted, ...sortedIncomplete]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="member" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill={dashboardColors.completed} />
                  <Bar dataKey="incomplete" fill={dashboardColors.notCompleted} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </div>
  
          {/* الـ Boxes على اليمين */}
          <div className="flex flex-col gap-10 md:w-1/3">
            {/* ✅ Top 3 Completed */}
            <Box className="bg-white p-4 rounded-lg shadow-md">
              <Typography variant="h6" gutterBottom>🔥 Top 3 High-Performing Members</Typography>
              {sortedCompleted.map((user, idx) => (
                <Box key={idx} className="flex items-center gap-4 py-2 border-b">
                  <Avatar src={getImageUrl(user.image)} />
                  <div>
                    <Typography fontWeight="bold">{user.member}</Typography>
                    <Typography color="text.secondary">
                      Completed Tasks: {user.completed}
                    </Typography>
                  </div>
                </Box>
              ))}
            </Box>
  
            {/* ✅ Top 3 Incomplete */}
            <Box className="bg-white p-4 rounded-lg shadow-md">
              <Typography variant="h6" gutterBottom>😴 Least Productive Members</Typography>
              {sortedIncomplete.map((user, idx) => (
                <Box key={idx} className="flex items-center gap-4 py-2 border-b">
                  <Avatar src={getImageUrl(user.image)} />
                  <div>
                    <Typography fontWeight="bold">{user.member}</Typography>
                    <Typography color="text.secondary">
                      Incomplete Tasks: {user.incomplete}
                    </Typography>
                  </div>
                </Box>
              ))}
            </Box>
          </div>
        </div>
      </>
    )}
  </Box>
  
  
  );
};

export default AdminTaskOverview;

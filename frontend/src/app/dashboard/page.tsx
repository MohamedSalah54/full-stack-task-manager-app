
'use client';

import { Box, Typography, CircularProgress, CardContent,  Avatar } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import TaskPieChart from '@/components/dashboard/teamLead/TaskPieChart';
import TeamPerformanceChart from '@/components/dashboard/teamLead/TeamPerformanceChart';
import NotificationList from '@/components/dashboard/teamLead/NotificationList';
import TaskTimeline from '@/components/dashboard/teamLead/TaskTimeline';
import { useEffect } from 'react';
import { fetchTeams } from '@/redux/teamSlice';
import { fetchNotifications } from '@/redux/notificationSlice';
import { fetchAllTasksForTeamLead } from '@/redux/taskSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { dashboardColors } from '@/theme/colors';
import { fetchProfile } from '@/redux/profileSlice';
import ProtectedRoute from '@/components/ProtectedRoute';


const DashboardPage = () => {
  const userId = useAppSelector((state) => state.auth.user?.id);
  const team = useAppSelector((state) => state.teams.teams[0]);
  const teamId = useAppSelector((state) => state.teams.teams[0]?._id);
  const tasks = useSelector((state: RootState) => state.tasks.tasks);

  const teamMembersCount = team?.members?.length || 0;
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter((task) => task.completed).length || 0;
  const incompleteTasks = totalTasks - completedTasks;
    const currentUser = useAppSelector((state: RootState) => state.auth.user);
  

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchTeams());
  }, [dispatch]);
  
  useEffect(() => {
    if (teamId) {
      dispatch(fetchAllTasksForTeamLead(teamId));
    }
  }, [dispatch, teamId]);
  
  useEffect(() => {
    if (userId) {
      dispatch(fetchNotifications(userId));
      dispatch(fetchProfile(userId));  
    }
  }, [dispatch, userId]);
  
  const stats = [
    { label: 'Team Members', value: teamMembersCount },
    { label: 'Total Tasks', value: totalTasks },
    { label: 'Completed Tasks', value: completedTasks },
    { label: 'Incomplete Tasks', value: incompleteTasks },
  ];

  const getProgress = (label: string) => {
    if (label === 'Completed Tasks') {
      return (completedTasks / totalTasks) * 100 || 0;
    } else if (label === 'Incomplete Tasks') {
      return (incompleteTasks / totalTasks) * 100 || 0;
    }
    return 100;
  };

  const getColor = (label: string) => {
    if (label === 'Completed Tasks') return dashboardColors.completed;
    if (label === 'Incomplete Tasks') return dashboardColors.notCompleted;
    if (label === 'Total Tasks') return dashboardColors.totalTasks;
    if (label === 'Team Members') return dashboardColors.teamMembers;
    return dashboardColors.default;
  };

  const getImageUrl = (image: string) => {
    const baseUrl = "http://localhost:3001"; 
    return image?.startsWith("http")
      ? image.replace(/\\/g, "/")
      : `${baseUrl}/static/${image}`.replace(/\\/g, "/");
  };

  return (
    <ProtectedRoute>
    <Box p={4}>
      <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom>
        Welcome back, {team?.teamLeader?.name || currentUser?.name} !  🎉
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" textAlign="center" mb={3}>
        Here's an overview of your team's performance
      </Typography>

      {/* Displaying Team Stats & Team Members Box */}
      <div className="flex flex-wrap gap-5">
        <div className="flex-[2.7] min-w-[300px] bg-white rounded-lg p-4 shadow-md">
          <div className="flex flex-wrap gap-5 justify-center">
            {stats.map((stat) => {
              const progress = getProgress(stat.label);
              const color = getColor(stat.label);
              return (
                <div
                  key={stat.label}
                  className="flex-1 min-w-[200px] flex justify-center items-center h-[160px]"
                >
                  <div className="relative w-[160px] h-[160px] flex items-center justify-center">
                    <CircularProgress
                      variant="determinate"
                      value={progress}
                      size={160}
                      thickness={5}
                      sx={{ color }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <p className="text-xl font-bold">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-[1.5] min-w-[250px] max-h-[230px] overflow-y-auto bg-white rounded-lg p-4 shadow-md">
          <h2 className="text-lg font-bold mb-4">Team Members</h2>
          {team?.members?.map((member) => {
            const memberTasks = tasks.filter((task) => task.assignedTo?.email === member.email);
            const imageUrl = getImageUrl(member.image);  

            return (
              <div key={member._id} className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar src={imageUrl || ''} alt={member.name} />
                  <div>
                    <p className="font-bold">{member.name}</p>
                    <p className="text-sm text-gray-500">{member?.position}</p>
                  </div>
                </div>
                <p className="font-bold">{memberTasks.length} Tasks</p>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '40px', marginTop: '40px' }}>
        <div style={{ width: '48%', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <CardContent>
            <TaskPieChart />
          </CardContent>
        </div>
        <div style={{ width: '48%', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <CardContent>
            <TeamPerformanceChart />
          </CardContent>
        </div>
      </div>

      {/* Task Timeline & Notifications */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
        <div style={{ width: '48%', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <CardContent>
            <TaskTimeline />
          </CardContent>
        </div>
        <div style={{ width: '48%', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
          <CardContent>
            <NotificationList />
          </CardContent>
        </div>
      </div>
    </Box>
    </ProtectedRoute>
  );
};

export default DashboardPage;



// "use client";
// import React, { useEffect, useState } from 'react';
// import { Box, Typography, Avatar, CircularProgress } from '@mui/material';
// import { useAppDispatch, useAppSelector } from '@/hooks/redux';
// import { fetchAllTasks } from '@/redux/taskSlice';
// import { fetchAllUsers } from '@/lib/user';
// import { fetchTasksWithTeamNameAndStatus } from '@/lib/tasks';

// interface TeamStats {
//   teamName: string;
//   completedTasks: number;
//   pendingTasks: number;
// }

// const dashboardColors = {
//   totalTeams: '#2196f3',
//   inTeam: '#4caf50',
//   notInTeam: '#f44336',
// };

// const AdminTeamOverview = () => {
//   const dispatch = useAppDispatch();
//   const { tasks, loading } = useAppSelector((state) => state.tasks);
//   const { user: users, loading: userLoading } = useAppSelector((state) => state.createUser);
//   const [topTeams, setTopTeams] = useState<TeamStats[]>([]);
//   const [worstTeams, setWorstTeams] = useState<TeamStats[]>([]);
//   const [error, setError] = useState<string>('');

//   useEffect(() => {
//     dispatch(fetchAllTasks());
//   }, [dispatch]);

//   useEffect(() => {
//     if (!users || users.length === 0) {
//       dispatch(fetchAllUsers());
//     }
//   }, [dispatch, users]);

//   useEffect(() => {
//     const fetchTeams = async () => {
//       try {
//         const tasksData = await fetchTasksWithTeamNameAndStatus();
//         const sortedTopTeams = tasksData
//           .filter((team: any) => team.completedTasks >= 1)
//           .sort((a: any, b: any) => b.completedTasks - a.completedTasks)
//           .slice(0, 3);

//         const sortedWorstTeams = tasksData
//           .sort((a: any, b: any) => b.pendingTasks - a.pendingTasks)
//           .slice(0, 3);

//         setTopTeams(sortedTopTeams);
//         setWorstTeams(sortedWorstTeams);
//       } catch (err: any) {
//         setError(err.message);
//       }
//     };
//     fetchTeams();
//   }, []);

//   const usersInTeams = users?.filter((user) => user.team).length || 0;
//   const usersNotInTeams = (users?.length || 0) - usersInTeams;
//   const totalUsers = users?.length || 0;

//   const teamIdToNameMap = new Map();
//   (users || []).forEach((user: any) => {
//     if (user.team) {
//       teamIdToNameMap.set(user.team, user.teamName);
//     }
//   });

//   const teamTaskStats = (tasks || []).reduce((acc: any, task: any) => {
//     const teamId = task.teamId?.toString();
//     if (!teamId) return acc;

//     if (!acc[teamId]) {
//       acc[teamId] = { teamId, completedTasks: 0, incompleteTasks: 0 };
//     }

//     if (task.status === 'COMPLETED') {
//       acc[teamId].completedTasks += 1;
//     } else {
//       acc[teamId].incompleteTasks += 1;
//     }

//     return acc;
//   }, {});

//   const totalTeams = new Set(users?.filter((user: any) => user.team).map((user: any) => user.team.toString())).size;

//   const stats = [
//     { label: 'Total Teams', value: totalTeams },
//     { label: 'Users in Teams', value: usersInTeams },
//     { label: 'Users not in Teams', value: usersNotInTeams },
//   ];

//   const getProgress = (label: string) => {
//     if (!users || users.length === 0) return 0;
//     if (label === 'Users in Teams') return (usersInTeams / users.length) * 100;
//     if (label === 'Users not in Teams') return (usersNotInTeams / users.length) * 100;
//     return 100;
//   };

//   const getColor = (label: string) => {
//     if (label === 'Users in Teams') return dashboardColors.inTeam;
//     if (label === 'Users not in Teams') return dashboardColors.notInTeam;
//     if (label === 'Total Teams') return dashboardColors.totalTeams;
//     return '#9e9e9e';
//   };
//   const renderTeamBox = (teams: TeamStats[], title: string, isTopTeams: boolean) => (
//     <Box className="bg-white p-4 rounded-lg shadow-md w-full max-w-[500px] w-full relative mr-0">
//       <Typography variant="h6" gutterBottom>{title}</Typography>
//       {teams.map((team, index) => (
//         <Box key={index} className="flex items-center gap-4 py-2 border-b">
//           <Avatar sx={{ bgcolor: `#${Math.floor(Math.random() * 16777215).toString(16)}` }}>
//             {team.teamName[0]}
//           </Avatar>
//           <div>
//             <Typography fontWeight="bold">{team.teamName}</Typography>
//             <Typography color="text.secondary">
//               {isTopTeams ? `${team.completedTasks} Completed` : `${team.pendingTasks} Incomplete`}
//             </Typography>
//           </div>
//         </Box>
//       ))}
//     </Box>
//   );


//   if (userLoading || loading) {
//     return (
//       <Box p={4} textAlign="center">
//         <Typography variant="h6">Loading...</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box p={4}>
//       <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">

//         {/* الدوائر على الشمال */}
//         <div className="flex flex-wrap gap-10 justify-center md:justify-start md:ml-20 w-full md:w-2/3">
//           {stats.map((stat, index) => (
//             <div
//               key={stat.label}
//               className="min-w-[150px] flex justify-center items-center h-[160px] w-full md:w-[160px]"
//             >
//               <div className="relative w-[160px] h-[160px] flex items-center justify-center">
//                 <CircularProgress
//                   variant="determinate"
//                   value={getProgress(stat.label)}
//                   size={160}
//                   thickness={5}
//                   sx={{ color: getColor(stat.label) }}
//                 />
//                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
//                   <p className="text-xl font-bold">{stat.value}</p>
//                   <p className="text-sm text-gray-500">{stat.label}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* البوكسين على أقصى اليمين */}
//         <div className="flex flex-col gap-10 w-full md:max-w-[500px] md:ml-auto">
//           {renderTeamBox(topTeams, '🔥 Top 3 High-Performing Teams', true)}
//           {renderTeamBox(worstTeams, '😴 Least Productive Teams', false)}
//         </div>

//       </div>
//     </Box>
//   );




// };

// export default AdminTeamOverview;
'use client';
import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, CircularProgress } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { fetchAllTasks } from '@/redux/taskSlice';
import { fetchAllUsers } from '@/lib/user';
import { fetchTasksWithTeamNameAndStatus } from '@/lib/tasks';
import { fetchAllNotifications } from '@/redux/notificationSlice';

interface TeamStats {
  teamName: string;
  completedTasks: number;
  pendingTasks: number;
}

const dashboardColors = {
  totalTeams: '#2196f3',
  inTeam: '#4caf50',
  notInTeam: '#f44336',
};

const AdminTeamOverview = () => {
  const dispatch = useAppDispatch();
  const { tasks, loading } = useAppSelector((state) => state.tasks);
  const { user: users, loading: userLoading } = useAppSelector((state) => state.createUser);

  const notifications = useAppSelector((state) => state.notifications.notifications);
  const notificationLoading = useAppSelector((state) => state.notifications.loading);
  const notificationError = useAppSelector((state) => state.notifications.error);

  const [topTeams, setTopTeams] = useState<TeamStats[]>([]);
  const [worstTeams, setWorstTeams] = useState<TeamStats[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    dispatch(fetchAllTasks());
    if (!users || users.length === 0) {
      dispatch(fetchAllUsers());
    }
    if (notifications.length === 0) {
      dispatch(fetchAllNotifications());
    }
  }, [dispatch, users, notifications.length]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const tasksData = await fetchTasksWithTeamNameAndStatus();
        const sortedTopTeams = tasksData
          .filter((team: any) => team.completedTasks >= 1)
          .sort((a: any, b: any) => b.completedTasks - a.completedTasks)
          .slice(0, 3);

        const sortedWorstTeams = tasksData
          .sort((a: any, b: any) => b.pendingTasks - a.pendingTasks)
          .slice(0, 3);

        setTopTeams(sortedTopTeams);
        setWorstTeams(sortedWorstTeams);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchTeams();
  }, []);

  const usersInTeams = users?.filter((user) => user.team).length || 0;
  const usersNotInTeams = (users?.length || 0) - usersInTeams;
  const totalUsers = users?.length || 0;

  const totalTeams = new Set(users?.filter((user: any) => user.team).map((user: any) => user.team.toString())).size;

  const stats = [
    { label: 'Total Teams', value: totalTeams },
    { label: 'Users in Teams', value: usersInTeams },
    { label: 'Users not in Teams', value: usersNotInTeams },
  ];

  const getProgress = (label: string) => {
    if (!users || users.length === 0) return 0;
    if (label === 'Users in Teams') return (usersInTeams / users.length) * 100;
    if (label === 'Users not in Teams') return (usersNotInTeams / users.length) * 100;
    return 100;
  };

  const getColor = (label: string) => {
    if (label === 'Users in Teams') return dashboardColors.inTeam;
    if (label === 'Users not in Teams') return dashboardColors.notInTeam;
    if (label === 'Total Teams') return dashboardColors.totalTeams;
    return '#9e9e9e';
  };

  const latestNotifications = [...notifications]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const renderTeamBox = (teams: TeamStats[], title: string, isTopTeams: boolean) => (
    <Box className="bg-white p-4 rounded-lg shadow-md w-full max-w-[500px]">
      <Typography variant="h6" gutterBottom>{title}</Typography>
      {teams.map((team, index) => (
        <Box key={index} className="flex items-center gap-4 py-2 border-b">
          <Avatar sx={{ bgcolor: `#${Math.floor(Math.random() * 16777215).toString(16)}` }}>
            {team.teamName[0]}
          </Avatar>
          <div>
            <Typography fontWeight="bold">{team.teamName}</Typography>
            <Typography color="text.secondary">
              {isTopTeams ? `${team.completedTasks} Completed` : `${team.pendingTasks} Incomplete`}
            </Typography>
          </div>
        </Box>
      ))}
    </Box>
  );

  if (userLoading || loading) {
    return (
      <Box p={4} textAlign="center">
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">

        {/* الجزء الخاص بالدوائر والإشعارات */}
        <div className="flex flex-col w-full md:w-2/3 gap-10 lg:ml-16 xl:ml-24">
          {/* الدوائر */}
          <div className="flex flex-wrap gap-10 justify-center md:justify-start ml-20">
  {stats.map((stat, index) => (
    <div
      key={stat.label}
      className={`min-w-[150px] flex justify-center items-center h-[160px] w-full md:w-[160px] 
        ${stats.length % 2 !== 0 && index === stats.length - 1 ? 'mx-auto' : ''}
      `}
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
</div>


          {/* الإشعارات */}
          <div className="bg-white p-4 rounded-lg shadow-md w-full md:w-[600px] lg:w-[700px]">
            <Typography variant="h6" className="mb-4">Recent Notifications</Typography>
            {notificationLoading && <div>Loading notifications...</div>}
            {notificationError && <div className="text-red-500">{notificationError}</div>}
            {!notificationLoading && latestNotifications.length === 0 && (
              <div>No notifications found.</div>
            )}
            <ul className="space-y-4">
              {latestNotifications.map((notif) => (
                <li key={notif._id} className="flex justify-between p-2 border-b">
                  <div>
                    <div className="font-semibold">{notif.message}</div>
                    <div className="text-sm text-gray-500">{new Date(notif.date).toLocaleString()}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* البوكسات الخاصة بالفرق */}
        <div className="flex flex-col gap-10 w-full md:max-w-[500px] md:ml-auto">
          {renderTeamBox(topTeams, '🔥 Top 3 High-Performing Teams', true)}
          {renderTeamBox(worstTeams, '😴 Least Productive Teams', false)}
        </div>

      </div>
    </Box>
  );
};

export default AdminTeamOverview;

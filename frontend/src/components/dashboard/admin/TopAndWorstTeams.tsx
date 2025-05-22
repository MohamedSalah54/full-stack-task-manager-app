// "use client";
// import React, { useEffect, useState } from 'react';
// import { Box, Typography, Avatar, CircularProgress } from '@mui/material';
// import { fetchTasksWithTeamNameAndStatus } from '@/lib/tasks';

// interface TeamStats {
//   teamName: string;
//   completedTasks: number;
//   pendingTasks: number;
// }

// const TopAndWorstTeams = () => {
//   const [topTeams, setTopTeams] = useState<TeamStats[]>([]);
//   const [worstTeams, setWorstTeams] = useState<TeamStats[]>([]);
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>('');

//   useEffect(() => {
//     const fetchTeams = async () => {
//       setLoading(true);
//       try {
//         const tasks = await fetchTasksWithTeamNameAndStatus();

//         const sortedTopTeams = tasks
//           .filter((team: any) => team.completedTasks >= 1)
//           .sort((a: any, b: any) => b.completedTasks - a.completedTasks)
//           .slice(0, 3);

//         const sortedWorstTeams = tasks
//           .sort((a: any, b: any) => b.pendingTasks - a.pendingTasks)
//           .slice(0, 3);

//         setTopTeams(sortedTopTeams);
//         setWorstTeams(sortedWorstTeams);
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTeams();
//   }, []);

//   if (loading) {
//     return <CircularProgress />;
//   }

//   if (error) {
//     return <Typography color="error">{error}</Typography>;
//   }

//   const renderTeamBox = (teams: TeamStats[], title: string, isTopTeams: boolean) => {
//     return (
//       <Box className="bg-white p-4 rounded-lg shadow-md w-full max-w-[400px] mx-auto relative top-[-100px] mr-7">
//         <Typography variant="h6" gutterBottom>{title}</Typography>
//         {teams.map((team, index) => (
//           <Box key={index} className="flex items-center gap-4 py-2 border-b">
//             <Avatar sx={{ bgcolor: `#${Math.floor(Math.random() * 16777215).toString(16)}` }}>
//               {team.teamName[0]}
//             </Avatar>
//             <div>
//               <Typography fontWeight="bold">{team.teamName}</Typography>
//               <Typography color="text.secondary">
//                 {isTopTeams ? `${team.completedTasks} Completed` : `${team.pendingTasks} Incomplete`}
//               </Typography>
//             </div>
//           </Box>
//         ))}
//       </Box>

//     );
//   };

//   return (
//     <div className="flex flex-col items-end gap-10">
//       {renderTeamBox(topTeams, '🔥 Top 3 High-Performing Teams', true)}
//       {renderTeamBox(worstTeams, '😴 Least Productive Teams', false)}
//     </div>
//   );
// };

// export default TopAndWorstTeams;

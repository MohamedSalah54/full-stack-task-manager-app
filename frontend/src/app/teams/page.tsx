"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTeams, removeTeam } from "../../redux/teamSlice";
import { RootState } from "../../redux/store";
import { Team } from "../../interfaces/team";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CreateTeamModal from "../../components/teams/dashboard/CreateTeamModal";
import { useAppSelector } from "@/hooks/redux";
import { Edit, Delete, Add } from "@mui/icons-material";
import DeleteTeamModal from "@/components/teams/dashboard/DeleteTeamModal";
import Loader from "@/loader/Loader";
import UpdateTeamModal from "@/components/teams/dashboard/UpdateTeamModal ";
import { updateTeam } from "@/lib/teams";
import CreateTaskModal from "../../components/teams/dashboard/CreateTaskModal";
import { Card, CardContent, Typography, Badge, Box, CircularProgress } from "@mui/material";
import { green, red } from "@mui/material/colors";
import { fetchTasksTeam } from "@/lib/tasks";
import { setTasks } from "@/redux/taskSlice";

const TeamPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { teams } = useAppSelector(
    (state: RootState) => state.teams
  );
  const currentUser = useAppSelector((state: RootState) => state.auth.user);

  const teamId = useAppSelector((state) => state.teams.teams[0]?._id);
  console.log("teamIDDDD:" + teamId);



  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCreateTaskModal, setCreateTaskModal] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const loading = useAppSelector((state) => state.tasks.loading);

  useEffect(() => {
    if (!teamId) {
      console.log("teamId is undefined, waiting for it to load...");
      return; // لا نعمل Fetch إلا إذا كان teamId موجود
    }

    console.log("Fetching tasks for teamId:", teamId); // Log to track the fetch attempt
    fetchTasksTeam(teamId)
      .then((tasksData) => {
        console.log("Fetched tasks:", tasksData);  // Log to see fetched tasks
        dispatch(setTasks(tasksData));
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);  // Log error if fetch fails
      });
  }, [teamId]);

  const handleTaskCreated = () => {
    console.log("Task created, fetching updated tasks...");
    if (teamId) {
      fetchTasksTeam(teamId)
        .then((tasksData) => {
          console.log("Fetched tasks after creation:", tasksData); // Log to see fetched tasks after creation
          dispatch(setTasks(tasksData));
        })
        .catch((error) => {
          console.error("Error fetching tasks after creation:", error);  // Log error if fetch fails
        });
    }
  };


  const handleConfirmDelete = async () => {
    try {
      await dispatch(removeTeam(teams[0]._id));
      setShowDeleteModal(false);
      router.push("/");
    } catch (error) {
      toast.error("Failed to delete team");
    }
  };

  const handleUpdateTeam = async () => {
    try {
      await dispatch(updateTeam({ id: teams[0]._id, data: updateData })).unwrap();

      // لا نعرض رسالة success هنا
      setShowUpdateModal(false);
      router.push("/teams");

    } catch (error) {
    }
  }


  useEffect(() => {
    setIsClient(true);


    if (typeof currentUser === "undefined" || currentUser === null) {
      return;
    }

    setIsAuthLoading(false);

    if (!currentUser) {
      toast.error("You need to be logged in to access this page.");
      router.push("/login");
      return;
    }

    if (currentUser.role !== "user" && currentUser.role !== "team-lead") {
      toast.error("You are not authorized to view this page.");
      router.push("/");
      return;
    }

    dispatch(fetchTeams()).then(() => setHasFetched(true));
  }, [dispatch, currentUser, router]);


  if (!isClient || isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-medium">
        Loading authentication...
      </div>
    );
  }

  const baseUrl = "http://localhost:3001";
  const hasTeam = teams && teams.length > 0;
  const team = hasTeam ? teams[0] : null;

  const renderSidebar = (team: Team) => {
    if (!team) {
      return <div className="p-6"><Loader /></div>;
    }
    console.log(team);


    return (
      <div className="w-1/5 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
        {/* Sidebar content */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{team.name}</h2>
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Team Lead</h3>
          <div className="flex items-center">
            {team.teamLeader && team.teamLeader.image ? (
              <img
                src={
                  team.teamLeader.image.startsWith("http")
                    ? team.teamLeader.image
                    : `${baseUrl}/static/${team.teamLeader.image}`.replace(/\\/g, "/")
                }
                alt={team.teamLeader.name}
                className="w-10 h-10 rounded-full object-cover border mr-3"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
            )}
            {team.teamLeader?.name && team.teamLeader?.email ? (
              <div>
                <p className="text-gray-800 font-medium text-sm">{team.teamLeader.name}</p>
                <p className="text-gray-500 text-xs">{team.teamLeader.email}</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 text-sm">No team leader info</p>
              </div>
            )}

          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Members</h3>
          <div className="space-y-3" key={team._id}>
            {team.members && team.members.length > 0 ? (
              team.members.map((member, index) => {
                const uniqueKey = member._id
                  ? `${member._id}-${member.email}`
                  : `member-${index}-${member.email}`;

                const imageUrl = member.image?.startsWith("http")
                  ? member.image.replace(/\\/g, "/")
                  : `${baseUrl}/static/${member.image}`.replace(/\\/g, "/");

                return (
                  <div key={uniqueKey} className="flex items-center">
                    <img
                      src={imageUrl}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover border mr-3"
                    />
                    <div>
                      <p className="text-gray-800 text-sm font-medium">{member.name}</p>
                      <p className="text-gray-500 text-xs">{member.email}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">No members found</p>
            )}
          </div>

        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Description</h3>
          <p className="text-gray-700 text-sm">{team.description}</p>
        </div>
      </div>
    );
  };

  if (!hasFetched) return <div className="p-10"><Loader /></div>;



  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar for team-lead */}
      {hasTeam && currentUser?.role === "team-lead" && (
        <div className="h-16 bg-white shadow px-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Team Dashboard</h1>

          <div className="flex space-x-2">
            <button className="flex items-center bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm transition"
              onClick={() => setShowUpdateModal(true)}
            >
              <Edit className="mr-1" fontSize="small" />
              Edit Team
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 text-sm transition"
            >
              <Delete className="mr-1" fontSize="small" />
              Delete Team
            </button>

            <button
              onClick={() => setCreateTaskModal(true)}
              className="flex items-center bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-sm transition"
            >
              <Add className="mr-1" fontSize="small" />
              Create Task
            </button>
          </div>

        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Case: No team yet */}
        {!hasTeam && (
          <div className="flex flex-1 justify-center items-center">
            {currentUser?.role === "team-lead" ? (
              <div className="text-center">
                <p className="text-3xl font-bold mb-6">Create your team</p>
                <button
                  onClick={() => setShowCreateTeamModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded text-lg hover:bg-blue-700 transition"
                >
                  Create
                </button>
              </div>
            ) : (
              <p className="text-2xl font-bold">You are not part of any team yet</p>
            )}
          </div>
        )}

        {/* Case: Team exists */}
        {hasTeam && (
          <>
            {renderSidebar(teams[0])}
            <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
              <Typography variant="h5" component="h2" color="textPrimary" gutterBottom>
                Tasks
              </Typography>

              {loading ? (
                <CircularProgress />
              ) : tasks.length === 0 ? (
                <Typography color="textSecondary" variant="body2">
                  No tasks available.
                </Typography>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tasks.map((task) => (
                    <Card key={task._id} sx={{ maxWidth: 345, mb: 2, position: "relative" }}>
                      <Badge
                        color={task.completed ? "success" : "error"}
                        variant="dot"
                        sx={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          zIndex: 1,
                          "& .MuiBadge-dot": {
                            backgroundColor: task.completed ? green[500] : red[500],
                          },
                        }}
                      />
                      <CardContent>
                        <Typography variant="h6" color="textPrimary" gutterBottom>
                          {task.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                          {task.description}
                        </Typography>
                        <Typography variant="caption" color="textPrimary">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </Typography>

                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                          <Typography variant="body2" color="textSecondary">
                            Assigned to: {task.assignedTo}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

      </div>

      {/* Create Modal */}
      {showCreateTeamModal && (
        <CreateTeamModal onClose={() => setShowCreateTeamModal(false)}
        />
      )}
      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteTeamModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
      {/* Update Modal */}
      {showUpdateModal && teams[0] && (
        <UpdateTeamModal
          team={teams[0]}
          onClose={() => setShowUpdateModal(false)}
          onConfirm={handleUpdateTeam}
        />
      )}
      {/* Create Task Modal */}
      {showCreateTaskModal && (
        <CreateTaskModal
          teamId={teamId}
          onClose={() => setCreateTaskModal(false)}
          onTaskCreated={handleTaskCreated}

        />
      )}

    </div>
  );
};

export default TeamPage;


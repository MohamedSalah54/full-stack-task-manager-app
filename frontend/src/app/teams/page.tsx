"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchTeams, removeTeam } from "../../redux/teamSlice";
import { RootState } from "../../redux/store";
import { Team } from "../../interfaces/team";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CreateTeamModal from "../../components/teams/dashboard/team/CreateTeamModal";
import { useAppSelector } from "@/hooks/redux";
import { Edit, Delete, Add } from "@mui/icons-material";
import DeleteTeamModal from "@/components/teams/dashboard/team/DeleteTeamModal";
import Loader from "@/loader/Loader";
import UpdateTeamModal from "@/components/teams/dashboard/team/UpdateTeamModal ";
import { updateTeam } from "@/lib/teams";
import CreateTaskModal from "../../components/teams/dashboard/tasks/CreateTaskModal";
import { Card, CardContent, Typography, Badge, Box, CircularProgress } from "@mui/material";
import { green, red } from "@mui/material/colors";
import { deleteTask, fetchAllTasksForTeamLead, fetchTasksTeam, toggleTaskComplete } from "@/lib/tasks";
import { setTasks, updateTask } from "@/redux/taskSlice";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import UpdateTaskModal from "@/components/teams/dashboard/tasks/UpdateTaskModal";
import { Task } from "@/interfaces/taskList";
import DeleteTaskModal from "@/components/teams/dashboard/tasks/DeleteTaskModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CommentsModal from "@/components/comments/CommentModal";

const TeamPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { teams } = useAppSelector(
    (state: RootState) => state.teams
  );

  const currentUser = useAppSelector((state: RootState) => state.auth.user);

  const teamId = useAppSelector((state) => state.teams.teams[0]?._id);

  const tasks = useAppSelector((state) => state.tasks.tasks);
  const loading = useAppSelector((state) => state.tasks?.loading);

  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCreateTaskModal, setCreateTaskModal] = useState(false);
  const [showUpdateTaskModal, setShowUpdateTaskModal] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);

  const [selectedTaskForComments, setSelectedTaskForComments] = useState(null);

  const handleOpenComments = (task: any) => {
    setSelectedTaskForComments(task);
  };

  const handleCloseComments = () => {
    setSelectedTaskForComments(null);
  };




  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, taskId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedTaskId(taskId);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSelectedTaskId(null);
  };





  const handleToggle = async (taskId: string) => {
    try {
      const updatedTask = await toggleTaskComplete(taskId);

      dispatch(updateTask(updatedTask));

      if (updatedTask.completed) {
        toast.success("Task marked as completed!");
      } else {
        toast.success("Task marked as incomplete!");
      }

    } catch (error) {
      toast.error("Something went wrong while toggling task status");
    }
  };


  useEffect(() => {
    if (!teamId || !currentUser) {
      return;
    }

    if (currentUser.role === "team-lead") {
      fetchAllTasksForTeamLead(teamId)

        .then((tasksData) => {
          dispatch(setTasks(tasksData));
        })
        .catch((error) => {
          console.error("Error fetching tasks for team lead:", error);
        });
    } else {
      fetchTasksTeam()
        .then((tasksData) => {
          dispatch(setTasks(tasksData));
        })
        .catch((error) => {
          console.error("Error fetching tasks for team members:", error);
        });
    }
  }, [dispatch, teamId, currentUser]);

  useEffect(() => {
    if (tasks.length > 0) {
      console.log("Tasks loaded from backend:", tasks);
    }
  }, [tasks]);


  const handleTaskCreated = () => {
    if (teamId) {
      fetchTasksTeam(teamId)
        .then((tasksData) => {
          dispatch(setTasks(tasksData));
        })
        .catch((error) => {
        });
    }
  };

  const handleTaskUpdated = async () => {
    if (selectedTask) {
      try {
        dispatch(updateTask(selectedTask));
      } catch (err) {
        toast.error("Failed to update task in Redux.");
      }
    }
  };

  const deleteTaskHandler = async () => {
    if (!taskId) {
      toast.error("No task selected");
      return;
    }

    try {
      await deleteTask(taskId);

      toast.success("Task deleted successfully!");

      const updatedTasks = await fetchAllTasksForTeamLead(teamId);
      dispatch(setTasks(updatedTasks));

      setShowDeleteTaskModal(false);
      setTaskId(null);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Failed to delete task");
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




  const baseUrl = "http://localhost:3001";
  const hasTeam = teams && teams.length > 0;
  const team = hasTeam ? teams[0] : null;

  const renderSidebar = (team: Team) => {
    // if (!team) {
    //   return <div className="p-6"><Loader /></div>;
    // }


    return (
<ProtectedRoute>
  <div className="w-1/5 bg-gray-50 p-6 border-r border-gray-200 overflow-y-auto">
    
    <div className="hidden md:block">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">{team.name}</h2>
    </div>

    <div className="md:hidden space-y-6">
      {team.teamLeader && team.teamLeader.image && (
        <img
          src={
            team.teamLeader.image.startsWith("http")
              ? team.teamLeader.image
              : `${baseUrl}/static/${team.teamLeader.image}`.replace(/\\/g, "/")
          }
          alt={team.teamLeader.name}
          className="w-full max-w-xs mx-auto rounded-full object-cover aspect-square"
          style={{ objectFit: "cover" }}
        />
      )}

      {team.members && team.members.length > 0 && (
        <div className="space-y-4">
          {team.members.map((member, index) => {
            const imageUrl = member.image?.startsWith("http")
              ? member.image.replace(/\\/g, "/")
              : `${baseUrl}/static/${member.image}`.replace(/\\/g, "/");

            return (
              <img
                key={member._id || index}
                src={imageUrl}
                alt={member.name}
                className="w-full max-w-xs mx-auto rounded-full object-cover aspect-square"
                style={{ objectFit: "cover" }}
              />
            );
          })}
        </div>
      )}
    </div>

    <div className="hidden md:block">
      {/* Team Lead */}
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
            <p className="text-gray-500 text-sm">No team leader info</p>
          )}
        </div>
      </div>

      {/* Members */}
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
  </div>
</ProtectedRoute>


    );
  };

  // if (!hasFetched) return <div className="p-10"><Loader /></div>;



  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        {/* Navbar for team-lead */}
        {hasTeam && currentUser?.role === "team-lead" && (
          <div className="h-auto bg-white shadow px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800">Team Dashboard</h1>

            <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
              <button
                className="flex items-center bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm transition"
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
                      <Card
                        key={task._id}
                        sx={{
                          maxWidth: 345,
                          mb: 2,
                          position: "relative",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          height: "100%",
                        }}
                      >

                        {/* Badge on the LEFT */}
                        <Badge
                          color={task.completed ? "success" : "error"}
                          variant="dot"
                          sx={{
                            position: "absolute",
                            top: 10,
                            left: 10,
                            zIndex: 0,
                            "& .MuiBadge-dot": {
                              backgroundColor: task.completed ? green[500] : red[500],
                            },
                          }}
                        />

                        {/* More options icon on the RIGHT if role = team-lead */}
                        {currentUser?.role === "team-lead" && (
                          <>
                            <IconButton
                              aria-label="more"
                              aria-controls={`menu-${task._id}`}
                              aria-haspopup="true"
                              onClick={(e) => handleMenuOpen(e, task._id)}
                              sx={{ position: "absolute", top: 5, right: 5 }}
                            >
                              <MoreVertIcon />
                            </IconButton>

                            {selectedTaskId === task._id && (
                              <Menu
                                id={`menu-${task._id}`}
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl) && selectedTaskId === task._id}
                                onClose={handleClose}
                                anchorOrigin={{
                                  vertical: "top",
                                  horizontal: "right",
                                }}
                                transformOrigin={{
                                  vertical: "top",
                                  horizontal: "right",
                                }}
                                PaperProps={{
                                  elevation: 3,
                                  sx: {
                                    mt: 1,
                                    minWidth: 180,
                                    borderRadius: 2,
                                  },
                                }}
                              >
                                <MenuItem
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setShowUpdateTaskModal(true);
                                    handleClose();
                                  }}
                                  sx={{ color: '#3b82f6' }}
                                >
                                  <EditIcon fontSize="small" sx={{ mr: 1, color: '#3b82f6' }} />
                                  Update
                                </MenuItem>


                                <MenuItem
                                  onClick={() => {
                                    setTaskId(task._id);
                                    setShowDeleteTaskModal(true);
                                    handleClose();
                                  }}
                                  sx={{ color: '#ef4444' }}
                                >
                                  <DeleteIcon fontSize="small" sx={{ mr: 1, color: '#ef4444' }} />
                                  Delete
                                </MenuItem>


                                <MenuItem
                                  onClick={() => { handleClose(); }}
                                  sx={{ color: task.completed ? '#ef4444' : '#10b981' }}
                                >
                                  {task.completed ? (
                                    <>
                                      <button onClick={() => handleToggle(task._id)}>
                                        <CancelIcon fontSize="small" sx={{ mr: 1, color: '#ef4444' }}

                                        />
                                        Mark as Incomplete
                                      </button>

                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleToggle(task._id)}
                                      >
                                        <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: '#10b981' }}

                                        />
                                        Mark as Complete
                                      </button>

                                    </>
                                  )}
                                </MenuItem>

                              </Menu>
                            )}
                          </>
                        )}
                        {currentUser?.role === "user" && (
                          <>
                            <IconButton
                              aria-label="more"
                              aria-controls={`menu-${task._id}`}
                              aria-haspopup="true"
                              onClick={(e) => handleMenuOpen(e, task._id)}
                              sx={{ position: "absolute", top: 5, right: 5 }}
                            >
                              <MoreVertIcon />
                            </IconButton>

                            {selectedTaskId === task._id && (
                              <Menu
                                id={`menu-${task._id}`}
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl) && selectedTaskId === task._id}
                                onClose={handleClose}
                                anchorOrigin={{
                                  vertical: "top",
                                  horizontal: "right",
                                }}
                                transformOrigin={{
                                  vertical: "top",
                                  horizontal: "right",
                                }}
                                PaperProps={{
                                  elevation: 3,
                                  sx: {
                                    mt: 1,
                                    minWidth: 180,
                                    borderRadius: 2,
                                  },
                                }}
                              >


                                <MenuItem
                                  onClick={() => { handleClose(); }}
                                  sx={{ color: task.completed ? '#ef4444' : '#10b981' }}
                                >
                                  {task.completed ? (
                                    <>
                                      <button onClick={() => handleToggle(task._id)}>
                                        <CancelIcon fontSize="small" sx={{ mr: 1, color: '#ef4444' }}

                                        />
                                        Mark as Incomplete
                                      </button>

                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleToggle(task._id)}
                                      >
                                        <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: '#10b981' }}

                                        />
                                        Mark as Complete
                                      </button>

                                    </>
                                  )}
                                </MenuItem>

                              </Menu>
                            )}
                          </>
                        )}

                        <CardContent>
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                              color: 'primary.main',
                              fontWeight: 'bold',
                            }}
                          >
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
                              Assigned to: {task.assignedTo?.name ?? "Unassigned"}
                            </Typography>
                          </Box>
                        </CardContent>
                        <div style={{ position: 'relative', width: '100%', height: '50px' }}>
                          <IconButton
                            style={{ position: 'absolute', right: '8px', bottom: '8px' }}
                            onClick={() => handleOpenComments(task)}
                            size="small"
                          >
                            <ChatBubbleOutlineIcon fontSize="small" />
                            <span className="ml-1 text-sm">{task.commentsCount ?? 0}</span>
                          </IconButton>
                        </div>








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
        {/* Update Task Modal */}
        {showUpdateTaskModal && selectedTask && (
          <UpdateTaskModal
            teamId={teamId}
            onClose={() => {
              setShowUpdateTaskModal(false);
              setSelectedTask(null);
            }}
            initialData={selectedTask}
            onTaskUpdated={handleTaskUpdated}
          />
        )}
        {/* Delete task modal */}
        {showDeleteTaskModal && (
          <DeleteTaskModal
            onCancel={() => setShowDeleteTaskModal(false)}
            onConfirm={deleteTaskHandler}
          />
        )}

        {selectedTaskForComments && (
          <CommentsModal
            open={Boolean(selectedTaskForComments)}
            onClose={handleCloseComments}
            task={selectedTaskForComments}
          />
        )}




      </div>
    </ProtectedRoute>
  );
};

export default TeamPage;


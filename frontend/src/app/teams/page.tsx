"use client";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchTeams } from "../../redux/teamSlice";
import { RootState } from "../../redux/store";
import { Team } from "../../interfaces/team";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CreateTeamModal from "../../components/teams/CreateTeamModal";
import { useAppSelector } from "@/hooks/redux";
import { Edit, Delete } from "@mui/icons-material";

const TeamPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { teams, loading, error } = useAppSelector(
    (state: RootState) => state.teams
  );
  const currentUser = useAppSelector((state: RootState) => state.auth.user);

  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const baseUrl = "http://localhost:3001";

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

    dispatch(fetchTeams());
  }, [dispatch, currentUser, router]);


  if (!isClient || isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-lg font-medium">
        Loading authentication...
      </div>
    );
  }

  const renderSidebar = (team: Team) => {


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
            <div>
              <p className="text-gray-800 font-medium text-sm">{team.teamLeader.name}</p>
              <p className="text-gray-500 text-xs">{team.teamLeader.email}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Members</h3>
          <div className="space-y-3">
            {team.members && team.members.length > 0 ? (
              team.members.map((member) => {
                const imageUrl = member.image?.startsWith("http")
                  ? member.image.replace(/\\/g, "/")
                  : `${baseUrl}/static/${member.image}`.replace(/\\/g, "/");

                return (
                  <div key={member._id} className="flex items-center">
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

  const hasTeam = teams && teams.length > 0;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar for team-lead */}
      {hasTeam && currentUser?.role === "team-lead" && (
        <div className="h-16 bg-white shadow px-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Team Dashboard</h1>
          <div className="flex space-x-2">
            <button className="flex items-center bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm transition">
              <Edit className="mr-1" fontSize="small" />
              Edit Team
            </button>
            <button className="flex items-center bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 text-sm transition">
              <Delete className="mr-1" fontSize="small" />
              Delete Team
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
            <div className="flex-1 bg-white"></div> {/* Right empty area */}
          </>
        )}
      </div>

      {/* Modal */}
      {showCreateTeamModal && (
        <CreateTeamModal onClose={() => setShowCreateTeamModal(false)} />
      )}
    </div>
  );
};

export default TeamPage;

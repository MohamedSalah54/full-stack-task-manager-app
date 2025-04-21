'use client';
import React, { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import { CreateTeamDto } from '../../../../interfaces/team';
import { RootState } from '../../../../redux/store';
import toast from 'react-hot-toast';
import { addTeam, fetchTeams } from '../../../../redux/teamSlice';
import { checkUserInTeam } from '../../../../lib/teams';
import Tooltip from '@mui/material/Tooltip';


interface CreateTeamModalProps {
  onClose: () => void;

}

const CreateTeamModal: React.FC<CreateTeamModalProps> = ({ onClose }) => {
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const { loading, error: teamError } = useSelector((state: RootState) => state.teams);

  const handleAddMember = () => {
    if (email && !members.includes(email)) {
      setMembers([...members, email]);
      setEmail('');
      setEmailStatus(null);
      setError('');
    } else {
      setError('Please enter a valid email or member already added.');
    }
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsChecking(true);

    if (!value) {
      setEmailStatus(null);
      setIsChecking(false);
      return;
    }

    try {
      console.log("Checking user with email:", value);
      const userStatus = await checkUserInTeam(value);
      console.log("User status response:", userStatus);

      if (userStatus) {
        if (userStatus.isFree) {
          setEmailStatus('Available');
        } else {
          setEmailStatus('In a team');
        }
      } else {
        setEmailStatus('User not found');
      }
    } catch (error) {
      console.error("Error while checking user:", error);
      setEmailStatus('Error checking user');
    } finally {
      setIsChecking(false);
    }
  };



  const handleCreateTeam = async () => {
    const teamData: CreateTeamDto = {
      name,
      description,
      members,
    };

    try {
      await dispatch(addTeam(teamData)).unwrap();

      await dispatch(fetchTeams()).unwrap();
      onClose();

      toast.success("Team created successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create team.");
    }
  };

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title className="text-2xl font-semibold leading-6 text-gray-800 mb-4">
                  Create Team
                </Dialog.Title>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Team Name"
                    className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <textarea
                    placeholder="Team Description"
                    className="w-full border border-gray-300 rounded px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="Member Email"
                      className="flex-1 border border-gray-300 rounded px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      value={email}
                      onChange={handleEmailChange}
                    />
                    <button
                      onClick={handleAddMember}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                      Add
                    </button>
                  </div>

                  {emailStatus && (
                    <Tooltip title={emailStatus} placement="top">
                      <div
                        className={`text-sm mt-2 ${emailStatus === 'In a team'
                          ? 'text-red-500'
                          : emailStatus === 'Available'
                            ? 'text-green-500'
                            : 'text-gray-600'
                          }`}
                      >
                        {emailStatus}
                      </div>
                    </Tooltip>
                  )}


                  {members.length > 0 && (
                    <ul className="space-y-1 text-sm text-gray-700">
                      {members.map((member, index) => (
                        <li key={index} className="flex items-center">
                          <span className="mr-2">{member}</span>
                          <button
                            onClick={() =>
                              setMembers((prev) => prev.filter((_, i) => i !== index))
                            }
                            className="text-black hover:text-red-600 text-base"
                          >
                            &times;
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}


                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}

                  {teamError && (
                    <div className="text-red-500 text-sm">{teamError}</div>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateTeam}
                    className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Team'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateTeamModal;

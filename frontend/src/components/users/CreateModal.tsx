'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { createUser } from '../../lib/createUser';
import { useAppDispatch, useAppSelector } from '../../hooks/redux'; 
import toast from 'react-hot-toast';
import { fetchAllUsers } from '@/lib/user';
import { Fragment } from 'react';

interface CreateModalProps {
  isOpen: boolean;
  handleCloseModal: () => void;
}

const CreateModal: React.FC<CreateModalProps> = ({ isOpen, handleCloseModal }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(true);

  const dispatch = useAppDispatch();
  const router = useRouter();

  const { user, error } = useAppSelector((state) => state.auth);  

  useEffect(() => {
    if (user) {
      if (user?.role !== 'admin' && user?.role !== 'team-lead') {
        router.push('/tasks'); 
      } else {
        setLoading(false); 
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(createUser({ email, password, name, role }));
    toast.success('User created successfully');
  
    dispatch(fetchAllUsers());  
  
    handleCloseModal();
  
    if (user) {
      router.push('/admin/dashboard/users');
    } else {
      toast.error('Something went wrong');
    }
  };
  

  if (loading || !isOpen) {
    return null; 
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          leave="ease-in duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex justify-center items-center z-50">
          <Dialog.Panel className="max-w-lg mx-4 p-8 bg-white rounded-2xl shadow-lg border border-gray-200 w-full sm:w-11/12 md:w-8/12 lg:w-6/12">
            <Dialog.Title className="text-2xl font-semibold text-center mb-6 text-gray-800">
              Create New User
            </Dialog.Title>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="team-lead">Team Lead</option>
                </select>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className="py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition duration-300 disabled:bg-blue-400"
                >
                  Create User
                </button>
                <button
                  onClick={handleCloseModal}
                  className="py-2 px-4 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 transition duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateModal;

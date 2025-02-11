'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import Loader from '@/loader/Loader';

const ProfilePage = () => {
  const { user, loading, updateProfile } = useProfile();
  const router = useRouter();

  const [editMode, setEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ name: string; bio: string; linkedin: string }>({
    name: '',
    bio: '',
    linkedin: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const handleGoBack = () => {
    router.push('/');
  };

  const openEditModal = () => {
    if (user) {
      setFormData({ name: user.name, bio: user.bio, linkedin: user.linkedin });
    }
    setEditMode(true);
  };

  const closeEditModal = () => {
    setEditMode(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    await updateProfile(formData);
    setEditMode(false);
  };

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-700">No user data found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 relative">
    <div className="w-full max-w-4xl mx-auto bg-white p-4 sm:p-6 rounded-lg shadow-lg relative">
      <button
        onClick={handleGoBack}
        className="text-gray-500 hover:text-gray-700 mb-4 flex items-center space-x-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>Back</span>
      </button>

      <button
        onClick={openEditModal}
        className="absolute top-4 right-4 text-white bg-indigo-600 hover:bg-indigo-800 rounded px-3 py-2 text-sm sm:px-4 sm:py-2"
      >
        Edit Profile
      </button>

      <div className="flex flex-col sm:flex-row items-center sm:space-x-6 space-y-4 sm:space-y-0">
        <img
          src={user.avatar}
          alt="Avatar"
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full"
        />
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-semibold text-indigo-600">
            {user.name}
          </h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-lg sm:text-xl font-semibold">Bio</h2>
        <p className="text-gray-700 mt-2">{user.bio}</p>
      </div>

      <div className="mt-6">
        <h2 className="text-lg sm:text-xl font-semibold">Find Me On</h2>
        <a
          href={user.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800"
        >
          LinkedIn Profile
        </a>
      </div>
    </div>

    {editMode && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md mx-4">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Edit Profile</h2>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded"
              rows={3}
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">LinkedIn URL</label>
            <input
              type="text"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={closeEditModal}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-800 text-sm"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default ProfilePage;

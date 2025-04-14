// lib/profile.ts
import axios from 'axios';
import { Profile, UpdateProfileDto } from '@/interfaces/profile';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:3001/profiles';

export const getMyProfile = async (userId: string): Promise<Profile> => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to fetch profile');
    }
    throw new Error('An unknown error occurred');
  }
};

export const updateUserProfile = async (
  userId: string,
  data: UpdateProfileDto & { profileImageFile?: File } 
): Promise<Profile> => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    if (key === 'profileImageFile') return;
    if (data[key as keyof UpdateProfileDto]) {
      formData.append(key, data[key as keyof UpdateProfileDto] as string);
    }
  });

  if (data.profileImageFile) {
    formData.append('profileImage', data.profileImageFile);
  }

  const response = await axios.patch(`${API_URL}/${userId}`, formData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const updateProfileForAdmin = async (
  userId: string,
  data: UpdateProfileDto & { profileImageFile?: File }
): Promise<Profile> => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    if (key === 'profileImageFile') return;
    if (data[key as keyof UpdateProfileDto]) {
      formData.append(key, data[key as keyof UpdateProfileDto] as string);
    }
  });

  if (data.profileImageFile) {
    formData.append('profileImage', data.profileImageFile);
  }

  try {
    await axios.patch(`${API_URL}/${userId}`, formData, {
      withCredentials: true, 
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    toast.success("Profile updated successfully!");
  } catch (error) {
    toast.error("Something went wrong while updating.");
    console.error(error);
  }

};

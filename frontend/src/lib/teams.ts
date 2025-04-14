// src/lib/teams.ts
import axios from 'axios';
import { Team, CreateTeamDto, UpdateTeamDto } from '@/interfaces/team';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:3001/teams';

export const getMyTeam = async (): Promise<Team | null> => {
  try {
    const response = await axios.get(`${API_URL}/my-team`, { withCredentials: true });


    if (!response.data || response.data.message === 'No team found') {
      return null; 
    }

    return response.data;
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
  }
};



export const createTeam = async (data: CreateTeamDto): Promise<Team> => {
  try {
    const response = await axios.post(`${API_URL}/create`, data, { withCredentials: true });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message as string;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
    toast.error(' failed to create team');
    throw new Error('something went wrong');
  }
};

export const updateTeam = async (id: string, data: UpdateTeamDto): Promise<Team> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, data, { withCredentials: true });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to update team');
    }
    throw new Error('An unknown error occurred');
  }
};

export const deleteTeam = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
    toast.success('Team deleted successfully!');
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to delete team');
    }
    throw new Error('An unknown error occurred');
  }
};


export const checkUserInTeam = async (email: string): Promise<any> => {
  try {
    const response = await axios.get(`${API_URL}/check-user`, { 
      params: { email },
      withCredentials: true 
    });
    // قم بإرجاع الشكل المناسب للاستجابة بناءً على البيانات المتوفرة
    return response.data;  // تأكد من أن الدالة ترجع الاستجابة الصحيحة
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || 'Failed to check user');
    }
    throw new Error('An unknown error occurred');
  }
};


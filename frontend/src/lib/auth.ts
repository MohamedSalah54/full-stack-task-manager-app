import api from './api';

export const registerUser = async (userData: { email: string; password: string; linkedinUrl: string }) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};


export const loginUser = async (userData: { email: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  export const logoutUser = async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Logout failed');
    }
  };
  
  

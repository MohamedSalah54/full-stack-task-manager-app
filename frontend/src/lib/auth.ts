import api from './api';



export const loginUser = async (userData: { email: string; password: string }) => {
  try {
    const response = await api.post('/auth/login', userData);
    return { token: response.data.token, user: response.data.user }; 
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};


export const logoutUser = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data; // إذا كان هناك رسالة، يتم إرجاعها
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Logout failed');
  }
};

  
  

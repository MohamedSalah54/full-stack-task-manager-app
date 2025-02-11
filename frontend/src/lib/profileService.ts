import API from './api'; 

export const getProfileData = async (): Promise<any> => {
  const response = await API.get('/profile');
  return response.data;
};

export const updateProfileData = async (formData: { name: string; bio: string; linkedin: string }): Promise<any> => {
  const response = await API.put('/profile', formData);
  return response.data;
};

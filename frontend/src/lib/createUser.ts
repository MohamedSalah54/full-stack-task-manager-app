import axios from '../lib/api';
import { createUserSlice } from '../redux/createUserSlice'; 
import { Dispatch } from 'redux'; 

export const createUser = (userData: { email: string; password: string; role: string, name: string }) => async (dispatch: Dispatch) => {
  try {
    dispatch(createUserSlice.actions.setLoading());

    const response = await axios.post('/auth/create-user', userData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
      },
    });

    dispatch(createUserSlice.actions.setUser(response.data.user));
  } catch (error: any) {
    dispatch(createUserSlice.actions.setError(error.response?.data?.message || 'Something went wrong'));
  }
};
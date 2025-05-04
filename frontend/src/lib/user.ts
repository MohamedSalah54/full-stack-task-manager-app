import { AppDispatch } from "../redux/store"; 
import axios from "../lib/api";
import { setLoading, setError, setUser } from "../redux/userSlice";
import mongoose from "mongoose";



export const fetchAllUsers = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading());
    const response = await axios.get("/users");
    dispatch(setUser(response.data));
  } catch (error: any) {
    dispatch(setError(error.response?.data?.message || "Failed to fetch users"));
  }
};


export const fetchSearchUsers = (searchQuery: {name: string, email: string, role: string }) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading());

    const params: any = {};

    if (searchQuery.name) {
      params.name = searchQuery.name;
    }
    if (searchQuery.email) {
      params.email = searchQuery.email;
    }
    if (searchQuery.role) {
      params.role = searchQuery.role;
    }

    // إرسال الاستعلام
    console.log("Sending search query:", params);

    const response = await axios.get("/users/search", { params });
    console.log("Search Results:", response.data);

    // تحقق من الـ response.data هنا
    if (response && response.data) {
      dispatch(setUser(response.data)); // تحديث الحالة بالنتائج
    } else {
      console.error("No data returned from search");
    }

  } catch (error: any) {
    console.error("Error while searching:", error);
    dispatch(setError(error.response?.data?.message || "Failed to search users"));
  }
};






export const updateUser = (id: string, userData: { name: string; email: string; role: string }) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading());
    await axios.patch(`/users/${id}`, userData); 
    dispatch(fetchAllUsers()); 
  } catch (error: any) {
    dispatch(setError(error.response?.data?.message || "Failed to update user"));
  }
};


export const deleteUser = (id: string) => async (dispatch: AppDispatch) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    dispatch(setLoading());
    await axios.delete(`/users/${id}`);
    dispatch(fetchAllUsers());
  } catch (error: any) {
    dispatch(setError(error.message || "Failed to delete user"));
  }
};

export const deleteManyUsers = (ids: string[]) => async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading());
    await axios.delete("/users", { data: { ids } });
    dispatch(fetchAllUsers()); 
  } catch (error: any) {
    dispatch(setError(error.response?.data?.message || "Failed to delete users"));
  }
};

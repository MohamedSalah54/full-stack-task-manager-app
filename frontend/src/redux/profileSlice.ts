import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Profile, UpdateProfileDto } from '@/interfaces/profile';
import { getMyProfile, updateProfileForAdmin, updateUserProfile } from '../lib/profile'; 

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

interface UpdateArgs {
  userId: string;
  data: UpdateProfileDto & { profileImageFile?: File };
}

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (userId: string) => {
    const profileData = await getMyProfile(userId);
    return profileData;
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async ({ userId, data }: UpdateArgs) => {
    return await updateUserProfile(userId, data);
  }
);

export const updateProfileForAdminThunk = createAsyncThunk(
  'profile/updateProfileForAdmin',
  async ({ userId, data }: UpdateArgs) => {
    return await updateProfileForAdmin(userId, data);
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(updateProfileForAdminThunk.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export default profileSlice.reducer;

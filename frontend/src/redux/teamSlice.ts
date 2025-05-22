// src/redux/teamSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getMyTeam, createTeam, updateTeam, deleteTeam, getAllTeams } from '../lib/teams'; 
import { Team, TeamState, CreateTeamDto, UpdateTeamDto } from '../interfaces/team';



export const fetchAllTeams = createAsyncThunk(
  'teams/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const teams = await getAllTeams();
      return teams;  
    } catch (err: any) {
      return rejectWithValue(err.message);  
    }
  }
);

export const fetchTeams = createAsyncThunk<Team[], void>(
  'teams/fetchTeams',
  async () => {
    const team = await getMyTeam();
    return team ? [team] : []; 
  }
);

export const addTeam = createAsyncThunk<Team, CreateTeamDto>(
  'teams/addTeam',
  async (data) => {
    const team = await createTeam(data);
    return team;
  }
);

export const editTeam = createAsyncThunk<Team, { id: string; data: UpdateTeamDto }>(
  'teams/editTeam',
  async ({ id, data }) => {
    const team = await updateTeam(id, data);
    return team;
  }
);

export const removeTeam = createAsyncThunk<void, string>(
  'teams/removeTeam',
  async (id) => {
    await deleteTeam(id);
  }
);



const initialState: TeamState = {
  teams: [],
  loading: false,
  error: null,
};

const teamSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload.length > 0 ? [action.payload[0].team] : [];
      })
      
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load teams';
      })

      .addCase(addTeam.pending, (state) => {
        state.loading = true;
      })
      .addCase(addTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams.push(action.payload);
      })
      .addCase(addTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add team';
      })

      .addCase(editTeam.pending, (state) => {
        state.loading = true;
      })
      .addCase(editTeam.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.teams.findIndex((team) => team.id === action.payload.id);
        if (index !== -1) {
          state.teams[index] = action.payload;
        }
      })
      .addCase(editTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update team';
      })

      .addCase(removeTeam.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = state.teams.filter((team) => team.id !== action.meta.arg);
      })
      .addCase(removeTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete team';
      })
      .addCase(fetchAllTeams.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.teams = action.payload;  // حفظ الفرق في الستور
      })
      .addCase(fetchAllTeams.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export default teamSlice.reducer;

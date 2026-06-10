import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '@shared/types';

interface UserState {
  data: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  data: null,
  status: 'idle',
  error: null,
};

export const fetchUserByEmail = createAsyncThunk<User, string>(
  'user/fetchUserByEmail',
  async (email, { rejectWithValue }) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(
        `${baseUrl}/api/v1/serve-volunteering/user/email?email=${email}`,
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.statusText}`);
      }
      const data = await response.json();
      // Persist for quick access
      localStorage.setItem('userId', data?.osid);
      localStorage.setItem('userDetails', JSON.stringify(data?.identityDetails));
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  },
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.data = null;
      state.status = 'idle';
      state.error = null;
      localStorage.removeItem('userId');
      localStorage.removeItem('userDetails');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserByEmail.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserByEmail.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchUserByEmail.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.data = null;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;

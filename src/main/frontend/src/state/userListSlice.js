//USER details of all
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const configData = require("../configure.js");

const initialState = {
  data: [],
  status: "idle",
  error: null,
};

export const fetchUserList = createAsyncThunk(
  "user/fetchUserList",
  async () => {
    try {
      const response = await axios.get(`${configData.USER_GET}/all-users`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

const userListSlice = createSlice({
  name: "userlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserList.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserList.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchUserList.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});
export default userListSlice.reducer;

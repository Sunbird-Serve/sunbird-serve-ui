//USER details for a emailId
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const configData = require("../configure.js");

const initialState = {
  data: {},
  status: "idle",
  error: null,
};

export const fetchUserByEmail = createAsyncThunk(
  "user/fetchUserByEmail",
  async (email) => {
    try {
      const response = await axios.get(
        `${configData.USER_GET}/email?email=${email}`
      );
      localStorage.setItem("userId", response?.data?.osid);
      localStorage.setItem(
        "userDetails",
        JSON.stringify(response?.data?.identityDetails)
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserByEmail.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserByEmail.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchUserByEmail.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
        state.data = {};
      });
  },
});
export default userSlice.reducer;

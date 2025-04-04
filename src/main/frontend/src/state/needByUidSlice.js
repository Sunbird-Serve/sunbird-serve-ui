//NEEDS raised by a user
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const configData = require("../configure.js");

const initialState = {
  data: [],
  status: "idle",
  error: null,
};

export const fetchNeedsByUid = createAsyncThunk(
  "needs/fetchNeedsByUid",
  async (userId) => {
    try {
      const response1 = await axios.get(
        `${configData.NEED_GET}/user/${userId}?page=0&size=1000&status=Approved`
      );
      const response2 = await axios.get(
        `${configData.NEED_GET}/user/${userId}?page=0&size=1000&status=Nominated`
      );
      const response3 = await axios.get(
        `${configData.NEED_GET}/user/${userId}?page=0&size=1000&status=New`
      );
      const response4 = await axios.get(
        `${configData.NEED_GET}/user/${userId}?page=0&size=1000&status=Rejected`
      );
      return [
        ...response1.data.content,
        ...response2.data.content,
        ...response3.data.content,
        ...response4.data.content,
      ];
    } catch (error) {
      throw error;
    }
  }
);

const needByUidSlice = createSlice({
  name: "needsByUid",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNeedsByUid.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNeedsByUid.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchNeedsByUid.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});
export default needByUidSlice.reducer;

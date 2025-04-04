//NEEDS raised by nCoordinator
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const configData = require("../configure.js");

const initialState = {
  data: [],
  status: "idle",
  error: null,
};

export const fetchNeedtypes = createAsyncThunk(
  "needtypes/fetchNeedtypes",
  async () => {
    try {
      const response = await axios.get(
        `${configData.NEEDTYPE_GET}/?page=0&size=1000&status=Approved`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
);

const needtypeSlice = createSlice({
  name: "needtypes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNeedtypes.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNeedtypes.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchNeedtypes.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});
export default needtypeSlice.reducer;

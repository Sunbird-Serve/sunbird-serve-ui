//NEEDS raised by nCoordinator

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const configData = require("../configure.js");

const initialState = {
  data: [],
  status: "idle",
  entityNeedsData: [],
  entityNeedsStatus: "idle",
  error: null,
};

export const fetchNeeds = createAsyncThunk("needs/fetchNeeds", async () => {
  try {
    const response1 = await axios.get(
      `${configData.NEED_GET}/?page=0&size=1000&status=New`
    );
    const response2 = await axios.get(
      `${configData.NEED_GET}/?page=0&size=1000&status=Nominated`
    );
    const response3 = await axios.get(
      `${configData.NEED_GET}/?page=0&size=1000&status=Approved`
    );
    const response4 = await axios.get(
      `${configData.NEED_GET}/?page=0&size=1000&status=Rejected`
    );
    const response5 = await axios.get(
      `${configData.NEED_GET}/?page=0&size=1000&status=Assigned`
    );
    const response6 = await axios.get(
      `${configData.NEED_GET}/?page=0&size=1000&status=Fulfilled`
    );
    return [
      ...response1.data.content,
      ...response2.data.content,
      ...response3.data.content,
      ...response4.data.content,
      ...response5.data.content,
      ...response6.data.content,
    ];
  } catch (error) {
    return Promise.reject(
      error.response?.data?.message || "Failed to fetch needs"
    );
  }
});

// Fetch entity NEEDS using a single POST request with entityIds
export const fetchEntityNeeds = createAsyncThunk(
  "needs/fetchEntityNeeds",
  async (entityIds, { rejectWithValue }) => {
    try {
      if (entityIds.length > 0) {
        const response = await axios.post(`${configData.ENTITY_NEEDS}`, {
          entityIds,
        });
        return response.data.content;
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch entity needs"
      );
    }
  }
);

const needSlice = createSlice({
  name: "needs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handling fetchNeeds
      .addCase(fetchNeeds.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchNeeds.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchNeeds.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Handling fetchEntityNeeds
      .addCase(fetchEntityNeeds.pending, (state) => {
        state.entityNeedsStatus = "loading";
      })
      .addCase(fetchEntityNeeds.fulfilled, (state, action) => {
        state.entityNeedsStatus = "succeeded";
        state.entityNeedsData = action.payload;
      })
      .addCase(fetchEntityNeeds.rejected, (state, action) => {
        state.entityNeedsStatus = "failed";
        state.error = action.payload;
      });
  },
});

export default needSlice.reducer;

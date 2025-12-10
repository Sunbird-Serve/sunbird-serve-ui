import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filteredData: [], // Default state
  adminSearchQuery: "",
  adminNeedTypeFilter: "",
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setFilteredData: (state, action) => {
      state.filteredData = action.payload;
    },
    setAdminSearchQuery: (state, action) => {
      state.adminSearchQuery = action.payload;
    },
    setAdminNeedTypeFilter: (state, action) => {
      state.adminNeedTypeFilter = action.payload;
    },
  },
});

export const { setFilteredData, setAdminSearchQuery, setAdminNeedTypeFilter } = filterSlice.actions;

export default filterSlice.reducer;

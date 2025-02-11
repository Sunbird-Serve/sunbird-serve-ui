import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filteredData: [], // Default state
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setFilteredData: (state, action) => {
      state.filteredData = action.payload;
    },
  },
});

export const { setFilteredData } = filterSlice.actions;

export default filterSlice.reducer;

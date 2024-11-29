import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	redirection: true,
};

const redirectToOnlineTeachingSlice = createSlice({
	name: "redirectToOnlineTeaching",
	initialState,
	reducers: {
		redirectToOnlineTeachingPage: (state) => {
			state.redirection = false;
		},
	},
});

export const { redirectToOnlineTeachingPage } = redirectToOnlineTeachingSlice.actions;
export default redirectToOnlineTeachingSlice.reducer;

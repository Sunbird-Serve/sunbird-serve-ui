import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import needReducer from "./needSlice";
import userListReducer from "./userListSlice";
import needtyperReducer from "./needtypeSlice";
import entityReducer from "./entitySlice";
import needByUidReducer from "./needByUidSlice";
import redirectToOnlineTeachingReducer from "./redirectionToOnlineTeachingSlice";
import filterReducer from "./filterSlice";

const store = configureStore({
  reducer: {
    need: needReducer,
    user: userReducer,
    userlist: userListReducer,
    needtype: needtyperReducer,
    entity: entityReducer,
    needbyuid: needByUidReducer,
    redirectToOnlineTeaching: redirectToOnlineTeachingReducer,
    filter: filterReducer,
  },
});

export default store;

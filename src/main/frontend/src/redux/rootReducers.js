import { combineReducers } from "redux";
import needplansReducers from "./features/needplans/reducers";

// root reducer combines all the reducers and passes it on to the redux store 
export default combineReducers({
  needplansReducers,
  // Add more reducers here if needed
});

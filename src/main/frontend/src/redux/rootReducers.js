import { combineReducers } from "redux";
import needplansReducers from "./features/needplans/reducers";
import needReducer from "./features/needs/needReducer"

// root reducer combines all the reducers and passes it on to the redux store 
const rootReducers = combineReducers({
  needplansReducers,
  needs: needReducer,
  // Add more reducers here if needed
});

export default rootReducers
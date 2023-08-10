import * as types from "./types";

// reducers are used to manipulate the redux state values 

// dispatching an action will trigger the reducer based on the type prop
export default function needplansReducers(state = {}, action) { 
  switch (action.type) {
    case types.SET_NEEDS:
      console.log("called ", action.payload);
      return {
        ...state, // state refers to the redux state
        needs: action.payload,
      };
    default:
      return state;
  }
}

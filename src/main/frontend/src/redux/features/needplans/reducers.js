import * as types from "./types";

export default function needplansReducers(state = {}, action) {
  switch (action.type) {
    case types.SET_NEEDS:
      console.log("called ", action.payload);
      return {
        ...state,
        needs: action.payload,
      };
    default:
      return state;
  }
}

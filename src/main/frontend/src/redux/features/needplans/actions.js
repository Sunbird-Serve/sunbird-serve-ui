import * as types from "./types";


// actions trigger a reducer or a saga based on the 'type' property  
const getNeeds = () => ({
  type: types.GET_NEEDS, // type prop is mandatory for all actions
});

const setNeeds = (payload) => ({
  type: types.SET_NEEDS,
  payload: payload, // payload prop is optional and will contain data that can be passed to sagas and redux
});

export { setNeeds, getNeeds };

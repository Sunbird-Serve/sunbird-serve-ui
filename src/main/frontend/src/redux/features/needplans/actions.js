import * as types from "./types";

const getNeeds = () => ({
  type: types.GET_NEEDS,
});

const setNeeds = (payload) => ({
  type: types.SET_NEEDS,
  payload: payload,
});

export { setNeeds, getNeeds };

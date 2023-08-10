import { pathOr } from "ramda";

// selectors pick the required data from the redux state. 

export const getData = (state) =>
  pathOr([], ["needplansReducers", "needs"], state);

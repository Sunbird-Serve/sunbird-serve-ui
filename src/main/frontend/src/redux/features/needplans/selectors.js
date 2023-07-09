import { pathOr } from "ramda";
export const getData = (state) =>
  pathOr([], ["needplansReducers", "needs"], state);

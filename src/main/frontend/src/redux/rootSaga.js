import { all } from "redux-saga/effects";
import needPlansSagas from "./features/needplans/sagas";

export default function* rootSaga() {
  yield all([
    needPlansSagas(),
    // Add more watchers for other sagas here if needed
  ]);
}

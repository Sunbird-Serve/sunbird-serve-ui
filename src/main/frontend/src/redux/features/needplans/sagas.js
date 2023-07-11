import { put, takeEvery, call, all } from "redux-saga/effects";
import * as actions from "./actions";
import * as types from "./types";
import axios from "axios";

// sagas are used to perform async operations mainly API calls

function* fetchData() {
  try {
    const data = yield call(axios.get, "https://dummyjson.com/products");
    yield put(actions.setNeeds(data));
  } catch (error) {
    window.alert(JSON.stringify(error));
  }
}

// an action dispatch will trigger the watch function with the respective type
// this in turn calls the function which performs the desired operation
function* watchFetchData() {
  yield takeEvery(types.GET_NEEDS, fetchData); // takeEvery will monitor all the action triggers and call a saga function based on the type prop
}

export default function* needPlansSagas() {
  yield all([watchFetchData()]);
}

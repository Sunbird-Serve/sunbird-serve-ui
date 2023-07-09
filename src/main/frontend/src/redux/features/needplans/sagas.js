import { put, takeEvery, call, all } from "redux-saga/effects";
import * as actions from "./actions";
import * as types from "./types";
import axios from "axios";

function* fetchData() {
  try {
    const data = yield call(axios.get, "https://dummyjson.com/products");
    yield put(actions.setNeeds(data));
  } catch (error) {
    window.alert(JSON.stringify(error));
  }
}

function* watchFetchData() {
  yield takeEvery(types.GET_NEEDS, fetchData);
}

export default function* needPlansSagas() {
  yield all([watchFetchData()]);
}

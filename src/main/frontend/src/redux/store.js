import { createStore, applyMiddleware, compose } from "redux";
import rootReducers from "./rootReducers";
import { composeWithDevTools } from "redux-devtools-extension";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./rootSaga";

const sagaMiddleware = createSagaMiddleware();

const composeEnhancers = composeWithDevTools({});

const store = createStore(
  rootReducers,
  composeEnhancers(applyMiddleware(sagaMiddleware)),
);

sagaMiddleware.run(rootSaga);

export default store;

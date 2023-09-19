import { createStore, applyMiddleware, compose } from "redux";
import rootReducers from "./rootReducers";
import { composeWithDevTools } from "redux-devtools-extension";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./rootSaga";
import thunk from 'redux-thunk'

const sagaMiddleware = createSagaMiddleware();

// this function allows us to monitor the redux operations in our browser using 'redux dev tools'
const composeEnhancers = composeWithDevTools({});

// store handles all the redux operations, it takes the reducers and sagas as prams
const store = createStore(
  rootReducers,
  composeEnhancers(applyMiddleware(sagaMiddleware, thunk)),
);

// adding sagas to the middleware function to link the sagas to the store
sagaMiddleware.run(rootSaga);

export default store;


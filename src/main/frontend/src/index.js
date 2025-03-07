import React from "react";
import { render } from "react-dom";
import "./index.css";
import App from "./App";
import { Provider } from "react-redux";
import store from "./state/store";
import { BrowserRouter } from "react-router-dom";

const root = document.getElementById("root");
render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
  root
);

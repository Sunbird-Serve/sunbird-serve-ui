import "./App.css";
import React, { useEffect, useState } from "react";
import LoginPage from "./containers/LoginPage/LoginPage";
import MainPage from "./containers/MainPage/MainPage";
import { auth } from "./firebase";
import { Provider } from "react-redux";
import store from "./redux/store";

function App() {
  const [presentUser, setPresentUser] = useState(null);
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setPresentUser({
          uid: user.uid,
          email: user.email,
        });
      } else {
        setPresentUser(null);
      }
    });
  }, []);
  return (
    <Provider store={store}>
      <div className="App">{presentUser ? <MainPage /> : <LoginPage />}</div>
    </Provider>
  );
}

export default App;

import "./App.css";
import React, { useEffect, useState } from "react";
import LoginPage from "./containers/LoginPage/LoginPage";
import MainPage from "./containers/MainPage/MainPage";
import ExplorePage from "./containers/ExplorePage/ExplorePage"
import { auth } from "./firebase";
import { Provider } from "react-redux";
import store from "./redux/store";

function App() {
  const [presentUser, setPresentUser] = useState(null);
  //check if any user logged in and set uid and email if logged in
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setPresentUser({
          uid: user.uid,
          email: user.email
        });
      } else {
        setPresentUser(null);
      }
    });
  }, []); 
  const [volunteer,setVolunteer] = useState(false)
  const handleVolunteer = (value) => {
    setVolunteer(value);
};
 console.log(volunteer)
  return (
    <Provider store={store}>
      <div className="App row">
        { /* Load page depending on user login */}
        { !volunteer && (<>
        { presentUser ? <MainPage /> : <LoginPage getVolunteerStatus={handleVolunteer}/>}</>)}
        { volunteer && <ExplorePage />  }
      </div>
    </Provider>
  );
}

export default App;
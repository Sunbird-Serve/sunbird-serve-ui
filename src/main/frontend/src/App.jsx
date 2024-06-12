import "./App.css";
import React, { useEffect, useState } from "react";
import LoginPage from "./containers/LoginPage/LoginPage";
import MainPage from "./containers/MainPage/MainPage";
import ExplorePage from "./containers/ExplorePage/ExplorePage";
import { auth } from "./firebase";
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserByEmail } from './state/userSlice';
import { fetchNeeds } from './state/needSlice';
import { fetchNeedtypes } from './state/needtypeSlice';
import { fetchNeedsByUid } from "./state/needByUidSlice";
import { fetchEntities } from "./state/entitySlice";
import { fetchUserList } from "./state/userListSlice";

function App() {
  const dispatch = useDispatch();

  // AUTHENTICATION using firebase
  const [presentUser, setPresentUser] = useState(null);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setPresentUser({
          uid: user.uid,    // this is firebase userId
          email: user.email,
        });
      } else {
        setPresentUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // UPDATE USER STATE based on authenticated email
  const userDetails = useSelector((state) => state.user.data);
  console.log(userDetails);

  // Dispatch the user to store
  useEffect(() => {
    if (presentUser) {
      const userEmail = presentUser.email.replace(/@/g, "%40") || '';
      console.log(userEmail);
      dispatch(fetchUserByEmail(userEmail));
    }
  }, [dispatch, presentUser]);

  // UPDATE USERLIST
  useEffect(() => {
    dispatch(fetchUserList());
  }, [dispatch]);

  // UPDATE NEEDSBYID
  useEffect(() => {
    if (userDetails.osid) {
      dispatch(fetchNeedsByUid(userDetails.osid));
    }
  }, [dispatch, userDetails]);

  // UPDATE NEEDS
  useEffect(() => {
    dispatch(fetchNeeds());
  }, [dispatch]);

  // UPDATE NEEDTYPES
  useEffect(() => {
    dispatch(fetchNeedtypes());
  }, [dispatch]);

  // UPDATE ENTITIES
  useEffect(() => {
    dispatch(fetchEntities());
  }, [dispatch]);

  const [volunteer, setVolunteer] = useState(false);
  const handleVolunteer = (value) => {
    setVolunteer(value);    // explore button on-click
  };

  if (presentUser === null) {
    // User is not logged in
    return <LoginPage getVolunteerStatus={handleVolunteer} />;
  }

  if (userDetails === undefined) {
    // User details are being fetched
    return <div>Loading...</div>;
  }

  if (volunteer || (userDetails.role && userDetails.role.includes('Volunteer'))) {
    // User is a volunteer or clicked explore
    return <ExplorePage />;
  }

  // Default: render MainPage for other roles
  return <MainPage />;
}

export default App;

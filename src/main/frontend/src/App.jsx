import "./App.css";
import React, { useEffect, useState } from "react";
import LoginPage from "./containers/LoginPage/LoginPage";
import MainPage from "./containers/MainPage/MainPage";
import ExplorePage from "./containers/ExplorePage/ExplorePage"
import { auth } from "./firebase";

import { useSelector, useDispatch } from 'react-redux'
import { fetchUserByEmail } from './state/userSlice'
import { fetchNeeds } from './state/needSlice'
import { fetchNeedtypes } from './state/needtypeSlice'
import { fetchNeedsByUid } from "./state/needByUidSlice";
import { fetchEntities } from "./state/entitySlice";


function App() {
  const dispatch = useDispatch()

  const [presentUser, setPresentUser] = useState(null);
  //AUTHENTICATION using firebase
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

  //UPDATE USER STATE based on authenticated email
  const userDetails = useSelector((state)=> state.user.data)
  //dispatch the user to store
  useEffect(() => {
    if(presentUser){
    const userEmail = presentUser.email.replace(/@/g, "%40") || '';
    console.log(userEmail)
    dispatch(fetchUserByEmail(userEmail))
    }
  }, [dispatch, presentUser]);

  //UPDATE NEEDS
  useEffect(()=>{
    dispatch(fetchNeedsByUid(userDetails.osid))
  },[dispatch, userDetails])

  //UPDATE NEEDTYPES
  useEffect(()=>{
    dispatch(fetchNeedtypes())
  },[dispatch])
  //UPDATE ENTITIES
  useEffect(()=>{
    dispatch(fetchEntities())
  },[dispatch])


  const [volunteer,setVolunteer] = useState(false)
  const handleVolunteer = (value) => {
    setVolunteer(value);
  };



  return (
      <div className="App row">
        { /* Load page depending on user login */}
        { !volunteer && (<>
        { presentUser ? <MainPage /> : <LoginPage getVolunteerStatus={handleVolunteer}/>}</>)}
        { volunteer && <ExplorePage />  }
      </div>
  );
}

export default App;
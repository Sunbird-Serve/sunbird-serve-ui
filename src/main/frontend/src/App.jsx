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
import { fetchUserList } from "./state/userListSlice";


function App() {
  const dispatch = useDispatch()

  //AUTHENTICATION using firebase
  const [presentUser, setPresentUser] = useState(null);
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setPresentUser({
          uid: user.uid,    //this is firebase userId
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

   //UPDATE USERLIST
  useEffect(()=>{
    dispatch(fetchUserList())
  },[dispatch])

  //UPDATE NEEDSBYID
  useEffect(()=>{
    dispatch(fetchNeedsByUid(userDetails.osid))
  },[dispatch, userDetails])

  //UPDATE NEEDS
  useEffect(()=>{
    dispatch(fetchNeeds())
  },[dispatch])

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
        { /* when clicks explore button, volunteer will be true*/}
        { /* if not volunteer and logins, go to nCoordinator screen */}
        { !volunteer && (<>
          { presentUser ? 
              userDetails.role && userDetails.role.includes('Volunteer') ?
                <ExplorePage />
              :
              <MainPage /> 
            : 
            <LoginPage getVolunteerStatus={handleVolunteer}/>
          }</>)}
        { /* if volunteer, go to volunteer screen */ }
        { volunteer && <ExplorePage />  }
      </div>
  );
}

export default App;
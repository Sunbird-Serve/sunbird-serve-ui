import React, { useState, useEffect } from 'react'
import Avatar from '@mui/material/Avatar';
import randomColor from 'randomcolor'
import './VolunteerProfile.css'
import { NavLink, Redirect } from 'react-router-dom';
import { BrowserRouter, Switch, Route} from 'react-router-dom'
import VolunteerProfileInfo from '../VolunteerProfileInfo/VolunteerProfileInfo'
import VolunteerProfileNominations from '../VolunteerProfileNominations/VolunteerProfileNominations'
import VolunteerProfileNeedPlans from '../VolunteerProfileNeedPlans/VolunteerProfileNeedPlans'
import VolunteerProfileFavourites from '../VolunteerProfileFavourites/VolunteerProfileFavourites'
import {auth} from '../../firebase.js'
import configData from './../../configData.json'
import axios from 'axios'


function VProfile() {
    const [avatarColor, setAvatarColor] = useState(randomColor())
    const currentUser = auth.currentUser;

    const [userData, setUserData] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const email = currentUser.email.replace(/@/g, "%40");
        console.log(email);
  
        const response = await axios.get(`${configData.USER_GET}/?email=${email}`);
        setUserData(response.data);
        console.log(response.data)
      } catch (error) {
        console.log(error);
      }
    };
  
    if (currentUser.email) {
      fetchData();
    }
  }, [currentUser]);

  console.log(userData)

  const handleLogout = () => {
    auth.signOut()
    window.location.reload()
  }

  return (
    <BrowserRouter>
    <div className="wrapVProfile col">
        <div className="vProfileBanner">
            <div className="wrapUserInfo">
                <div className="profVIcon"> 
                  <Avatar style={{height:'64px',width:'64px',fontSize:'32px',backgroundColor:avatarColor}}>
                  </Avatar>
                </div>
                <div className="userInfo">
                    <div className="vName"> { (userData)? userData.identityDetails.fullname : '' }</div>
                    <div className="vContact">
                        <div className="vEmail">{ (userData)? userData.contactDetails.email : '' }</div>
                        <span>.</span>
                        <div className="vMobile">{ (userData)? userData.contactDetails.mobile : '' }</div>
                    </div>
                </div>
            </div>
            <div className="logoutButton">
                <button className="btnVLogout" onClick={handleLogout}>Logout</button>
            </div>
        </div>
        <div className="vProfNav">
            <NavLink to="/vpinfo" default className="vpNavItem" activeClassName="selectedTab">Profile</NavLink>
            <NavLink to="/vpnominations" className="vpNavItem" activeClassName="selectedTab">Nominations</NavLink>
            <NavLink to="/vpneedplans" className="vpNavItem" activeClassName="selectedTab">Need Plans</NavLink>
            <NavLink to="/vpfavourites" className="vpNavItem" activeClassName="selectedTab">Favourites</NavLink>
        </div>
        <div className="vpContent">
            <Switch>     
                <Route exact path="/vpinfo" component={VolunteerProfileInfo} />
                <Route path="/vpnominations" component={VolunteerProfileNominations} />
                <Route path="/vpneedplans" component={VolunteerProfileNeedPlans} />
                <Route path="/vpfavourites" component={VolunteerProfileFavourites} />
                <Redirect from="/" to="/vpinfo" />
            </Switch>
        </div>
    </div>
    </BrowserRouter>
  )
}

export default VProfile
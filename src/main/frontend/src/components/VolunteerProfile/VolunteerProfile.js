import React, { useState, useEffect } from 'react'
import Avatar from '@mui/material/Avatar';
import randomColor from 'randomcolor'
import './VolunteerProfile.css'
import { NavLink, Redirect } from 'react-router-dom';
import { BrowserRouter, Switch, Route} from 'react-router-dom'
import VolunteerProfileInfo from '../VolunteerProfileInfo/VolunteerProfileInfo'
import VolunteerProfileEdit from '../VolunteerProfileInfo/VolunteerProfileEdit'
import VolunteerProfileNominations from '../VolunteerProfileNominations/VolunteerProfileNominations'
import VolunteerProfileNeedPlans from '../VolunteerProfileNeedPlans/VolunteerProfileNeedPlans'
import VolunteerProfileFavourites from '../VolunteerProfileFavourites/VolunteerProfileFavourites'
import {auth} from '../../firebase.js'
import { useSelector, useDispatch } from 'react-redux'
import { fetchUserByEmail } from '../../state/userSlice'
import { useHistory } from 'react-router'



function VProfile() {
  const dispatch = useDispatch()
  const history = useHistory()

  const userData = useSelector((state)=> state.user.data)
  const [user, setUser] = useState(false)
  useEffect(()=>{
    if(userData){
      setUser(true)
    }
  },[userData])

  const [avatarColor, setAvatarColor] = useState(randomColor())

  const handleLogout = () => {
    auth.signOut()
    dispatch(fetchUserByEmail(''))
    history.push('/')
    window.location.reload()
  }

  return (
    <div className="wrapVProfile col">
        <div className="vProfileBanner">
            <div className="wrapUserInfo">
                <div className="profVIcon"> 
                  <Avatar style={{height:'64px',width:'64px',fontSize:'32px',backgroundColor:avatarColor}}>
                  </Avatar>
                </div>
            
                    <div className="userInfo">
                    <div className="vName"> { (user) ? userData.identityDetails.fullname : 'Unregistered User' }</div>
                    <div className="vContact">
                        <div className="vEmail">{ (user)? userData.contactDetails.email : 'Complete registration to create profile' }</div>
                        <span>.</span>
                        <div className="vMobile">{ (user)? userData.contactDetails.mobile : '' }</div>
                    </div>
                </div>
            </div>
            <div className="logoutButton">
                <button className="btnVLogout" onClick={handleLogout}>Logout</button>
            </div>
        </div>
        <div className="vProfNav">
            <NavLink to="/vprofile/vpinfo" default className="vpNavItem" activeClassName="selectedTab">Profile</NavLink>
            <NavLink to="/vprofile/vpnominations" className="vpNavItem" activeClassName="selectedTab">Nominations</NavLink>
            <NavLink to="/vprofile/vpneedplans" className="vpNavItem" activeClassName="selectedTab">Need Plans</NavLink>
            <NavLink to="/vprofile/vpfavourites" className="vpNavItem" activeClassName="selectedTab">Favourites</NavLink>
        </div>
        { userData &&
        <div className="vpContent">
            <Switch>     
                <Route exact path="/vprofile/vpinfo" component={VolunteerProfileInfo} />
                <Route path="/vprofile/vpedit" component={VolunteerProfileEdit} />
                <Route path="/vprofile/vpnominations" component={VolunteerProfileNominations} />
                <Route path="/vprofile/vpneedplans" component={VolunteerProfileNeedPlans} />
                <Route path="/vprofile/vpfavourites" component={VolunteerProfileFavourites} />
                <Redirect from="/vprofile" to="/vprofile/vpinfo" />
            </Switch>
        </div>
        }
    </div>
  )
}

export default VProfile
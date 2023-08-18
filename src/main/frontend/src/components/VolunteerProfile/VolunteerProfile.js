import React, { useState } from 'react'
import Avatar from '@mui/material/Avatar';
import randomColor from 'randomcolor'
import './VolunteerProfile.css'
import { NavLink } from 'react-router-dom';
import { BrowserRouter, Switch, Route} from 'react-router-dom'
import VolunteerProfileInfo from '../VolunteerProfileInfo/VolunteerProfileInfo'
import VolunteerProfileNominations from '../VolunteerProfileNominations/VolunteerProfileNominations'
import VolunteerProfileNeedPlans from '../VolunteerProfileNeedPlans/VolunteerProfileNeedPlans'
import VolunteerProfileFavourites from '../VolunteerProfileFavourites/VolunteerProfileFavourites'

function VProfile() {
    const [avatarColor, setAvatarColor] = useState(randomColor())

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
                    <div className="vName">Dwayne Johnshon</div>
                    <div className="vContact">
                        <div className="vEmail">Dwaynejohn@gmail.com</div>
                        <span>.</span>
                        <div className="vMobile">9876543210</div>
                    </div>
                </div>
            </div>
            <div className="logoutButton">
                <button className="btnVLogout">Logout</button>
            </div>
        </div>
        <div className="vProfNav">
            <NavLink to="/vpinfo" className="vpNavItem" activeClassName="selectedTab">Profile</NavLink>
            <NavLink to="/vpnominations" className="vpNavItem" activeClassName="selectedTab">Nominations</NavLink>
            <NavLink to="/vpneedplans" className="vpNavItem" activeClassName="selectedTab">Need Plans</NavLink>
            <NavLink to="/vpfavourites" className="vpNavItem" activeClassName="selectedTab">Favourites</NavLink>
        </div>
        <div className="vpContent">
            <Switch>     
                <Route exact path="/" component={VolunteerProfileInfo} />
                <Route path="/vpnominations" component={VolunteerProfileNominations} />
                <Route path="/vpneedplans" component={VolunteerProfileNeedPlans} />
                <Route path="/vpfavourites" component={VolunteerProfileFavourites} />
            </Switch>
        </div>
    </div>
    </BrowserRouter>
  )
}

export default VProfile
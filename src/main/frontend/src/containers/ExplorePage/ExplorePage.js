import React, { useState } from 'react'
import VolunteerHeader from '../../components/VolunteerHeader/VolunteerHeader'
import VolunteerFooter from '../../components/VolunteerFooter/VolunteerFooter'
import VolunteerNeedType from '../../components/VolunteerNeedType/VolunteerNeedType'
import VolunteerProfile from '../../components/VolunteerProfile/VolunteerProfile'
import Registration from '../../components/Registration/Registration'
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import { Redirect } from "react-router";
import {auth} from '../../firebase.js'

function ExplorePage() {
  
  return (
    <BrowserRouter>
      <Switch>     
      <div className="exploreNeeds">
      <div className="vHeader">
        <VolunteerHeader/>
      </div>
      <div className="wrapContent row mt-5 mt-sm-0 pl-5">
        <div>
                <Route exact path="/vneedtypes" component={VolunteerNeedType} />
                <Route path="/vregistration" component={Registration} />
                <Route path="/vprofile" component={VolunteerProfile} />
                <Redirect from="/" to="/vneedtypes" />
         </div>
      </div>
      <div>
        <VolunteerFooter />
      </div>
    </div>
    </Switch>
      
    </BrowserRouter>
  )
}

export default ExplorePage

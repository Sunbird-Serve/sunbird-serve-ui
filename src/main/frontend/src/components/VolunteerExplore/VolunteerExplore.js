import React from 'react'
import VolunteerNeedType from '../VolunteerNeedType/VolunteerNeedType'
import Registration from '../Registration/Registration'
import { BrowserRouter, Switch, Route} from 'react-router-dom'
import { Redirect } from "react-router";


function VolunteerExplore() {
  return (
    <div>
      <BrowserRouter>
            <Switch>     
                <Route exact path="/vneedtypes" component={VolunteerNeedType} />
                <Route path="/vregistration" component={Registration} />
                <Redirect from="/" to="/vneedtypes" />
            </Switch>

      </BrowserRouter>
    </div>
  )
}

export default VolunteerExplore
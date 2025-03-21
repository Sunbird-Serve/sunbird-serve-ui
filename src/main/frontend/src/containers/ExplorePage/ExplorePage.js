import React, { useState } from "react";
import VolunteerHeader from "../../components/VolunteerHeader/VolunteerHeader";
import VolunteerFooter from "../../components/VolunteerFooter/VolunteerFooter";
import VolunteerNeedType from "../../components/VolunteerNeedType/VolunteerNeedType";
import VolunteerProfile from "../../components/VolunteerProfile/VolunteerProfile";
import Registration from "../../components/Registration/Registration";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Redirect } from "react-router";

function ExplorePage() {
  return (
    <BrowserRouter>
      <Switch>
        <div className="exploreNeeds">
          <div className="vHeader">
            <VolunteerHeader />
          </div>
          <div className="wrapContent  mt-5 mt-sm-8 pl-5">
            <div>
              <Switch>
                <Route exact path="/vneedtypes" component={VolunteerNeedType} />
                <Route path="/vregistration" component={Registration} />
                <Route path="/vprofile" component={VolunteerProfile} />
                <Route path="/" component={VolunteerNeedType} />
              </Switch>
            </div>
          </div>
          <div>
            <VolunteerFooter />
          </div>
        </div>
      </Switch>
    </BrowserRouter>
  );
}

export default ExplorePage;

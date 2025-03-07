import "./MainPage.css";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import SideNav from "../../components/SideNav/SideNav";
import Header from "../../components/Header/Header";
import Needs from "../../components/Needs/Needs";
import RaiseNeed from "../../components/RaiseNeed/RaiseNeed";
import NeedPlans from "../../components/Need Plans/NeedPlans";
import Volunteers from "../../components/Volunteer/Volunteers";
import Settings from "../../components/Settings/Settings";
import Accounts from "../../components/Accounts/Accounts";
import Help from "../../components/Help/Help";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import CircularProgress from "@mui/material/CircularProgress";
import NoRoleAssigned from "../../components/NoRoleAssigned/NoRoleAssigned";
import Registration from "../../components/Registration/Registration";
import Dashboard from "../nAdmin/Dashboard";
import SessionDetails from "../nAdmin/SessionDetails";
import VolunteerList from "../vAdmin/VolunteerList";
import Agency from "../vAdmin/Agency";
import VolunteerSignup from "../../components/VolunteerSignup/VolunteerSignup";

const MainPage = () => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [role, setRole] = useState("");
  const userRole = useSelector((state) => state.user.data.role);
  const gridClass = role ? "col-lg-10" : "col-lg-12";
  useEffect(() => {
    console.log("Inside Main");
    console.log(userRole);
    const user = Array.isArray(userRole) ? userRole[0] : userRole;
    setRole(user);
    console.log("User role:", user);
  }, [userRole]);

  const toggleSideNav = () => {
    setIsSideNavOpen(!isSideNavOpen);
  };

  return (
    <Router>
      <div className="wrapMainPage">
        <div className="mainPage row">
          {role && (
            <>
              <div className="wrapSideNav col-8 col-sm-4 col-lg-2 d-none d-sm-block">
                <SideNav isOpen={isSideNavOpen} />
              </div>
              {isSideNavOpen && <SideNav />}
            </>
          )}

          <div className={`wrapDisplay col-12 col-sm-8 ${gridClass}`}>
            <div className="wrapHeader row">
              <Header toggleSideNav={toggleSideNav} role={role} />
            </div>
            <div className="wrapContent row mt-5 mt-sm-0 pl-5">
              <Switch>
                <Route
                  exact
                  path="/"
                  render={() => {
                    if (role === "nCoordinator") {
                      return <Redirect to="/needs" />;
                    } else if (role === "nAdmin") {
                      return <Redirect to="/nAdmin-dashboard" />;
                    } else if (role === "vAdmin") {
                      return <Redirect to="/volunteer-list" />;
                    } else if (role === "vCoordinator") {
                      return <Redirect to="/volunteers" />;
                    } else if (role) {
                    } else if (role === undefined) {
                      return <Redirect to="/no-role" />;
                    } else if (role) {
                      return <Redirect to="/volunteers" />;
                    }
                  }}
                />
                <Route path="/needs" component={Needs} />
                <Route path="/raiseneed" component={RaiseNeed} />
                <Route path="/needPlans" component={NeedPlans} />
                <Route path="/volunteers" component={Volunteers} />
                <Route path="/settings" component={Settings} />
                <Route path="/accounts" component={Accounts} />
                <Route path="/help" component={Help} />
                <Route path="/no-role" component={NoRoleAssigned} />
                <Route path="/vregistration" component={Registration} />
                <Route path="/nAdmin-dashboard" component={Dashboard} />
                <Route path="/volunteer-list" component={VolunteerList} />
                <Route path="/agencies" component={Agency} />
                <Route
                  path="/nAdmin-sessionDetails"
                  component={SessionDetails}
                />
                <Route
                  path="/volunteer/:agencyId/vregistration"
                  element={<Registration />}
                />
                <Route path="/signUp" component={VolunteerSignup} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default MainPage;

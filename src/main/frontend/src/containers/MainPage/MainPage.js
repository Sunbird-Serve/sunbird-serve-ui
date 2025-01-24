import "./MainPage.css";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import SideNav from "../../components/SideNav/SideNav";
import Header from "../../components/Header/Header";
import Dashboard from "../../components/Dashboard/Dashboard";
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
    <BrowserRouter>
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
              </Switch>
            </div>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default MainPage;

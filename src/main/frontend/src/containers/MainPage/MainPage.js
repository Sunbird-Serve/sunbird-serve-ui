import './MainPage.css';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import SideNav from '../../components/SideNav/SideNav';
import Header from '../../components/Header/Header';
import Dashboard from '../../components/Dashboard/Dashboard';
import Needs from '../../components/Needs/Needs';
import RaiseNeed from '../../components/RaiseNeed/RaiseNeed';
import NeedPlans from '../../components/Need Plans/NeedPlans';
import Volunteers from '../../components/Volunteer/Volunteers';
import Settings from '../../components/Settings/Settings';
import Accounts from '../../components/Accounts/Accounts';
import Help from '../../components/Help/Help';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import CircularProgress from '@mui/material/CircularProgress';

const MainPage = () => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  const userRole = useSelector((state) => state.user.data.role);
  console.log("Inside Main");
  console.log(userRole);

  const toggleSideNav = () => {
    setIsSideNavOpen(!isSideNavOpen);
  };

  // Assuming userRole might be an array
  const role = Array.isArray(userRole) ? userRole[0] : userRole;

  console.log('User role:', role); // Debugging the user role

  if (role === undefined) {
    // Show a loading spinner or any placeholder while the role is being fetched
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress color="secondary" />
        </div>
      );
  }

  return (
    <BrowserRouter>
      <div className="wrapMainPage">
        <div className="mainPage row">
          <div className="wrapSideNav col-8 col-sm-4 col-lg-2 d-none d-sm-block">
            <SideNav isOpen={isSideNavOpen} />
          </div>
          {isSideNavOpen && <SideNav />}

          <div className="wrapDisplay col-12 col-sm-8 col-lg-10">
            <div className="wrapHeader row">
              <Header toggleSideNav={toggleSideNav} />
            </div>
            <div className="wrapContent row mt-5 mt-sm-0 pl-5">
              <Switch>
                <Route exact path="/" render={() => (
                  role === 'nCoordinator' ? (
                    <Redirect to="/needs" />
                  ) : (
                    <Redirect to="/volunteers" />
                  )
                )} />
                <Route path="/needs" component={Needs} />
                <Route path="/raiseneed" component={RaiseNeed} />
                <Route path="/needPlans" component={NeedPlans} />
                <Route path="/volunteers" component={Volunteers} />
                <Route path="/settings" component={Settings} />
                <Route path="/accounts" component={Accounts} />
                <Route path="/help" component={Help} />
              </Switch>
            </div>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default MainPage;

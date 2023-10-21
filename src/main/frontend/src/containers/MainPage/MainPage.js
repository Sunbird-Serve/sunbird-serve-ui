import './MainPage.css'
import { BrowserRouter, Switch, Route} from 'react-router-dom'
import SideNav from '../../components/SideNav/SideNav'
import Header from '../../components/Header/Header'
import Dashboard from '../../components/Dashboard/Dashboard'
import Needs from '../../components/Needs/Needs'
import RaiseNeed from '../../components/RaiseNeed/RaiseNeed'
import NeedPlans from '../../components/Need Plans/NeedPlans'
import Volunteers from '../../components/Volunteer/Volunteers'
import Settings from '../../components/Settings/Settings'
import Accounts from '../../components/Accounts/Accounts'
import Help from '../../components/Help/Help'

const MainPage = () => {
    return(
        //main is the base container for all components
        <BrowserRouter>
            <div className="wrapMainPage">
                <div className="mainPage row">
                    {/* Side Navigation Component*/}
                    <div className="wrapSideNav col-8 col-sm-4 col-lg-2 d-none d-sm-block">
                        <SideNav/>      
                    </div>
                    <div className="wrapDisplay col-12 col-sm-8 col-lg-10">
                        {/* Top Header component*/}
                        <div className="wrapHeader row">
                            <Header/> 
                        </div>
                        {/*load different components by path which is selected in side navigation */}
                        <div className="wrapContent row mt-5 mt-sm-0 pl-5">
                            <Switch>     
                                <Route exact path="/" component={Dashboard} />
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
    )
}

export default MainPage

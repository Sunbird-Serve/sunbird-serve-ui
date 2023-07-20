import './MainPage.css'
import { BrowserRouter, Switch, Route} from 'react-router-dom'
import SideNav from '../../components/SideNav/SideNav'
import Header from '../../components/Header/Header'
import Dashboard from '../../components/Dashboard/Dashboard'
import Needs from '../../components/Needs/Needs'
import Volunteer from '../../components/Volunteer/Volunteer'
import Settings from '../../components/Settings/Settings'
import Accounts from '../../components/Accounts/Accounts'
import Help from '../../components/Help/Help'

const MainPage = () => {
    return(
        <BrowserRouter>
            <div className="mainPage row">
                <div className="wrapSideNav col-8 col-sm-4 col-lg-2">
                    <SideNav/>
                </div>
                <div className="wrapDisplay col-12 col-sm-8 col-lg-10">
                    <div className="wrapHeader row">
                        <Header/>
                    </div>
                    <div className="wrapContent row">
                        <Switch>
                            <Route exact path="/" component={Dashboard} />
                            <Route path="/needs" component={Needs} />
                            <Route path="/volunteer" component={Volunteer} />
                            <Route path="/settings" component={Settings} />
                            <Route path="/accounts" component={Accounts} />
                            <Route path="/help" component={Help} />
                        </Switch>
                    </div>
                </div>
            </div>    
        </BrowserRouter>
    )
}

export default MainPage


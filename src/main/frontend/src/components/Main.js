import { BrowserRouter,Routes,Route} from 'react-router-dom'
import SideNav from './SideNav'
import Header from './Header'
import Dashboard from '../pages/Dashboard'
import Needs from '../pages/Needs'
import Settings from '../pages/Settings'
import Accounts from '../pages/Accounts'
import Help from '../pages/Help'

const Main = () => {
    return(
        <BrowserRouter>
            <div className='main'>
                <SideNav />
                <div className="asideWrap">
                    <Header />
                    <Routes>
                        <Route exact path="/" element={<Dashboard/>} />
                        <Route path="/needs" element={<Needs/>} />
                        <Route path="/settings" element={<Settings/>} />
                        <Route path="/accounts" element={<Accounts/>} />
                        <Route path="/help" element={<Help/>} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    )
}

export default Main
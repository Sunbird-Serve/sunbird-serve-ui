import {auth} from '../firebase.js'
import { FaBell,FaUser } from "react-icons/fa"

function Header() {
  return (
    <div className="header">
      <div className="headWrapper">
        <div className="leftHead">
          <hdname> </hdname> 
        </div>
        <div className="rightHead">
          <div className="headIcons">
            <notificon><FaBell/></notificon>
          </div>
          <div className="profile">
            <ucon><FaUser/></ucon>
            <uname>UserName</uname>
            <logout><button onClick={() => auth.signOut()}>Logout</button></logout>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Header
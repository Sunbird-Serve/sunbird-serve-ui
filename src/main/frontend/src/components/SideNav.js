import { MdAnalytics, MdSettings } from "react-icons/md"
import { FaShoppingCart,FaUser } from "react-icons/fa"
import { BsFileTextFill,BsInfoSquareFill } from "react-icons/bs"
import { AiFillMessage } from "react-icons/ai"
import { Link } from "react-router-dom"

function SideNav() {
  return (
    <div className="sideNav">
      <div className="sidebarWrapper">
        <div className="sidebarMenu">
          <div className="logo">
            <img src={require("../clogo.jpg")} alt="BlueBirdLogo" />
          </div>
          <h3 className="sidebarTitle">CATEGORY</h3>
          <ul className="sidebarList">
            <li className="sidebarListItem">
              <MdAnalytics className="iconL"/> 
              <p><Link to="/" className="pLink"> Dashboard </Link></p>
            </li>
            <li className="sidebarListItem">
              <FaShoppingCart className="iconL"/>
              <p><Link to="/needs" className="pLink">Needs </Link></p>
            </li>
            <li className="sidebarListItem">
              <BsFileTextFill className="iconL"/>
              <p>Need Plans</p>
            </li>
            <li className="sidebarListItem">
              <BsFileTextFill className="iconL"/>
              <p>Menu1</p>
            </li>
            <li className="sidebarListItem">
              <BsFileTextFill className="iconL"/>
              <p>Menu2</p>
            </li>
          </ul>
          <h3 className="sidebarTitle">MANAGEMENT</h3>
          <ul className="sidebarList">
            <li className="sidebarListItem">
              <AiFillMessage className="iconL"/>
              <p>Menu1</p>
            </li>
            <li className="sidebarListItem">
              <AiFillMessage className="iconL"/>
              <p>Menu2</p>
            </li>
          </ul>
          <h3 className="sidebarTitle">OTHERS</h3>
          <ul className="sidebarList">
            <li className="sidebarListItem">
              <MdSettings className="iconL"/>
              <p><Link to="/settings" className="pLink"> Settings </Link></p>
            </li>
            <li className="sidebarListItem">
              <FaUser className="iconL"/>
              <p><Link to="/accounts" className="pLink"> Accounts </Link></p>
            </li>
            <li className="sidebarListItem">
              <BsInfoSquareFill className="iconL"/>
              <p><Link to="/help" className="pLink"> Help </Link></p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SideNav
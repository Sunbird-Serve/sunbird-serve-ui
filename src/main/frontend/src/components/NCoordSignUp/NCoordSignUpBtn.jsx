import { useState } from "react";
import CoordSignup from "../VolunteerSignup/VolunteerSignup";
import "./NCoordSignUpBtn.css"

const NCoordSignUpBtn = () => {

  const [showCoordSignUp, setShowCoordSignUp] = useState(false)

  const openCoordSignUp = () => setShowCoordSignUp(true)
  const closeCoordSignUp = () => setShowCoordSignUp(false)

  return (
    <>
      <div className="ncSignup">
        <a href="#" onClick={openCoordSignUp}>
          Sign up as Need Coordinator
        </a>
      </div>

      {showCoordSignUp && <CoordSignup onClose={closeCoordSignUp} regisRedirectUrl="/ncRegistration" />}
    </>
  )
}

export default NCoordSignUpBtn;
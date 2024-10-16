import React, { useState } from 'react'
import LoginForm from '../../components/LoginForm/LoginForm'
import SignUp from '../../components/SignUp/SignUp'
import LoginBanner from '../../components/LoginBanner/LoginBanner'
import './LoginPage.css'

const LoginPage = ({getVolunteerStatus}) => {
    const [signupUser, setSignupUser ] = useState(false);

    const handleSignup = (valueFromChild) => {
        setSignupUser(valueFromChild);
    };
 
    const handleVolunteer = (value) => {
        getVolunteerStatus(value)
    }

    return(
        //login page
        <div className="wrapLogin row">
            <div className="col-12 col-sm-6 order-sm-1 sideLogin">
                {/* form reading login credentials */}
                {signupUser ? <SignUp loginState={handleSignup} /> : <LoginForm loginState={handleSignup}/>}
            </div>
            <div className="col-12 col-sm-6 order-sm-2 sideBanner">
                {/* sunbird banner */}
                <LoginBanner volunteerStatus={handleVolunteer}/> 
            </div>
        </div>      
    )
}

export default LoginPage
import React, { useState } from 'react'
import LoginForm from '../../components/LoginForm/LoginForm'
import SignUp from '../../components/SignUp/SignUp'
import LoginBanner from '../../components/LoginBanner/LoginBanner'
import './LoginPage.css'

const LoginPage = () => {
    const [signupUser, setSignupUser ] = useState(false);

    const handleSignup = (valueFromChild) => {
        setSignupUser(valueFromChild);
    };

    return(
        //login page
        <div className="wrapLogin row">
            <div className="col-12 col-sm-6 order-sm-2 sideLogin">
                {/* form reading login credentials */}
                {signupUser ? <SignUp loginState={handleSignup} /> : <LoginForm loginState={handleSignup}/>}
            </div>
            <div className="col-12 col-sm-6 order-sm-1 sideBanner">
                {/* sunbird banner */}
                <LoginBanner /> 
            </div>
        </div>      
    )
}

export default LoginPage
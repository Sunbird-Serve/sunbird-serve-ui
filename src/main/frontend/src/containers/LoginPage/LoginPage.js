import React from 'react'
import LoginForm from '../../components/LoginForm/LoginForm'
import LoginBanner from '../../components/LoginBanner/LoginBanner'
import './LoginPage.css'

const LoginPage = () => {
    return(
        //login page
        <div className="wrapLogin row">
            <div className="col-12 col-sm-6 order-sm-2 sideLogin">
                <LoginForm />   {/* form reading login credentials */}
            </div>
            <div className="col-12 col-sm-6 order-sm-1 sideBanner">
                <LoginBanner /> {/* sunbird banner */}
            </div>
        </div>      
    )
}

export default LoginPage

//
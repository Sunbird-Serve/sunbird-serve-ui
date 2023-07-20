import React from 'react'
import LoginForm from '../../components/LoginForm/LoginForm'
import LoginBanner from '../../components/LoginBanner/LoginBanner'
import './LoginPage.css'

const LoginPage = () => {
    return(     
        <div className="row wrapLogin">
            <div className="col-12 col-sm-6 order-sm-2 sideLogin">
                <LoginForm />
            </div>
            <div className="col-12 col-sm-6 order-sm-1 sideBanner">
                < LoginBanner />
            </div>
        </div>     
    )
}

export default LoginPage
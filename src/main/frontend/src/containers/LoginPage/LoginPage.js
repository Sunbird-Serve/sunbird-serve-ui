import React from 'react'
import LoginForm from '../../components/LoginForm/LoginForm'
import LoginBanner from '../../components/LoginBanner/LoginBanner'
import './LoginPage.css'

const LoginPage = () => {
    return(
        <div className="wrapLogin">
            <LoginBanner />
            <LoginForm />  
        </div>      
    )
}

export default LoginPage
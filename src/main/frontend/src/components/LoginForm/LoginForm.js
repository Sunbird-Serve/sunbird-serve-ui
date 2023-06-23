import React,{useState} from 'react'
import {auth} from '../../firebase'
import SBLogo from '../../clogo.jpg'
import './LoginForm.css'

const LoginForm = () => {
    const [data,setData] = useState({
            email:"",
            password:""
        });
    const {email,password} = data;
    const changeHandler = e => {
        setData({...data,[e.target.name]:e.target.value})
    }
    const signUp = e => {
        e.preventDefault();
        auth.createUserWithEmailAndPassword(email,password).then(
            user => window.alert(user)
        ).catch(err => window.alert(err))
    }
    const logIn = e => {
        e.preventDefault();
        auth.signInWithEmailAndPassword(email,password).then(
            user => console.log(user)
        ).catch(err => window.alert(err))
    }
    return(
        <div className='loginForm'>
            <div className="sbLogo">
                <img src={SBLogo} alt="BlueBirdLogo" width="150px" />
            </div>
            <div className="boxLogin">
                <form className="menuLogin">
                    <div className="greetLogin" >Welcome Back!</div>
                    <div className="titleLogin" >Login</div>
                    <div className="unameLogin">
                        <label className="label" >Email</label>
                        <input className="input" type="text" name="email" value={email} onChange={changeHandler}/>
                    </div>
                    <div className="pwdLogin">
                        <label className="label" >Password</label>
                        <input className="input" type="password" name="password" value={password} onChange={changeHandler}/>
                    </div>
                    <div className="btnLogin">
                        <button type="login" onClick={logIn}>Login</button>
                    </div>  
                    <div className="loption">OR</div>
                    <div className="btnLogin">
                        <button type="login" onClick={signUp}>Signup</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LoginForm
import React,{useState} from 'react'
import { auth, gprovider, fprovider } from '../../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import SBLogo from '../../clogo.jpg'
import './LoginForm.css'
import { FcGoogle } from "react-icons/fc"
import { GrFacebook } from "react-icons/gr";

const LoginForm = () => {
    const [error,setError]= useState(false)
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
        createUserWithEmailAndPassword(auth, email,password).then(
            user => console.log(user)
        ).catch(err => console.log(err))
    }
    const logIn = e => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email,password).then(
            user => console.log(user)
        ).catch(err => setError(true) )
    }
    const signInWithGoogle = e => {
        e.preventDefault();
        signInWithPopup(auth, gprovider)
        }
    const signInWithFacebook = e => {
        e.preventDefault();
        signInWithPopup(auth, fprovider)
        }

    return(
        // adds user login form
        <div className="loginForm row">
            {/* Logo */}
            <div className="sbLogo col-12 col-sm-8 offset-sm-1 mt-sm-5">
                <img src={SBLogo} alt="BlueBirdLogo" width="120px" />
            </div>
            
            <form className="menuLogin col-12 col-sm-8 offset-sm-1 mt-sm-5">
                <div className="greetLogin " >Welcome Back!</div>
                <div className="titleLogin" >Login</div>   
                {/* user credentials */}
                <div className="unameLogin">
                    <label className="label" >Email Id / Mobile Number</label>
                    <input className="input" type="text" name="email" value={email} onChange={changeHandler} autoComplete='off'/>
                </div>
                <div className="pwdLogin">
                    <label className="label" >Password </label>
                    <input className="input" type="password" name="password" value={password} onChange={changeHandler} autoComplete='off'/>
                </div> 
                {/* Login button*/}
                <div className="btnLogin">
                    <button type="login" onClick={logIn}>Log in</button>
                    <div className="loption">or</div>
                    <button type="login" onClick={signUp}>Sign up</button>
                </div>   
                <div className="hline"><hr /></div>
                {/* Social Media Login*/}
                <div className="btnSLogin">
                    <button type="login" onClick={signInWithGoogle}> <i><FcGoogle /></i> Sign in with Google</button>
                    <button type="login" onClick={signInWithFacebook} > <i><GrFacebook /></i> Sign in with Facebook</button>
                </div>    
                {/* Error message when credentials are wrong*/}     
                {error&&<div className="loginError">Invalid Login Credentials. Make sure you signup before first login.</div>}  
            </form>
        </div>
    )
}

export default LoginForm
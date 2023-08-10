import React,{useState} from 'react'
import './LoginForm.css'
import { auth, gprovider, fprovider } from '../../firebase'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import SBLogo from '../../assets/sunbirdlogo.png'
import { FcGoogle } from "react-icons/fc"
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';

const LoginForm = ({loginState}) => {
    const [error,setError]= useState('');
    const [data,setData] = useState({
        email:"",
        password:""
    });
    const {email,password} = data;
    const changeHandler = e => {
        setData({...data,[e.target.name]:e.target.value})
    }
    const logIn = e => {
        e.preventDefault();
        signInWithEmailAndPassword(auth, email,password).then(
            user => console.log('Login Success')
        ).catch(err => setError(err.code) )
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
            <div className="sbLogo col-12 col-sm-7 offset-sm-1 mt-sm-5">
                <img src={SBLogo} alt="BlueBirdLogo" width="120px" />
            </div>
            {/* Add Login Form */}
            <form className="menuLogin col-12 col-sm-7 offset-sm-1 mt-sm-5">
                <div className="greetLogin " >Welcome Back!</div>
                <div className="titleLogin" >Login</div>   
                {/* user credentials */}
                <div className="unameLogin">
                    <label className="label" >Email Id</label>
                    <input className="input" type="text" name="email" value={email} placeholder='Enter your email address' onChange={changeHandler} autoComplete='off'/>
                </div>
                <div className="pwdLogin">
                    <label className="label" >Password </label>
                    <input className="input" type="password" name="password" value={password} placeholder='Enter your password' onChange={changeHandler} autoComplete='off'/>
                </div> 
                {/* Login button*/}
                <div className="btnLogin">
                    <button type="login" onClick={logIn}>Login</button>
                </div> 
                {/* goto Signup */}  
                <div className="gotoSignup">
                    <span>Don't have an account?</span>
                    <a href="#" onClick={() => loginState(true)}>Sign Up! </a>
                </div>
                <div className="hline">
                    <hr /> <span>or login with</span> <hr/>
                </div>
                {/* Social Media Login*/}
                <div className="btnSLogin">
                    <button type="login" onClick={signInWithGoogle}> <i><FcGoogle /></i>Google</button>
                    <button type="login" onClick={signInWithFacebook} > <i style={{color:'#1877F2'}}> <FacebookRoundedIcon /></i>Facebook</button>
                </div>    
                {/* Error message when credentials are wrong*/}     
                {error&&<div className="loginError">{error.slice(5,)}</div>}  
            </form>
        </div>
    )
}

export default LoginForm
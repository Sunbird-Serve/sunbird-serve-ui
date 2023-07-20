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
        <div className="loginForm row">
            <div className="sbLogo col-12 col-sm-8">
                <img src={SBLogo} alt="BlueBirdLogo" width="150px" />
            </div>
            <div className="greetLogin col-12 col-sm-8" >Welcome Back!</div>
            <div className="titleLogin col-12 col-sm-8" >Login</div>
                {error&&<div className="loginError">Invalid Login Credentials. Please signup before first login.</div>}
            <form className="menuLogin">
            <div className="unameLogin col-12 col-sm-8">
                <label className="label" >Email Id
                    <input className="input" type="text" name="email" value={email} onChange={changeHandler} autoComplete='off'/>
                </label>
                
            </div>
            <div className="pwdLogin col-12 col-sm-8">
                <label className="label" >Password
                    <input className="input" type="password" name="password" value={password} onChange={changeHandler} autoComplete='off'/>
                </label>
                
            </div>
            <div className="btnLogin col-12 col-sm-8">
                <button type="login" onClick={logIn}>Log in</button>
                <div className="loption">OR</div>
                <button type="login" onClick={signUp}>Sign up</button>
            </div>
            <div className="hline col-12 col-sm-8"><hr /></div>
            <div className="btnSLogin col-12 col-sm-8">
                <button type="login" onClick={signInWithGoogle}> <i><FcGoogle /></i> Sign in with Google</button>
                <button type="login"onClick={signInWithFacebook} > <i><GrFacebook /></i> Sign in with Facebook</button>
            </div>                                    
            </form>
        </div>
    )
}

export default LoginForm
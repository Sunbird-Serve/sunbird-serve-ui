import React,{useEffect, useState} from 'react'
import './VolunteerLogin.css'
import { auth, gprovider, fprovider } from '../../firebase'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import SBLogo from '../../assets/sunbirdlogo.png'
import { FcGoogle } from "react-icons/fc"
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import { useSelector, useDispatch } from 'react-redux'
import { Redirect, useHistory } from "react-router-dom";

const VolunteerLogin = ({loginState, onClose}) => {
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
    const userId = useSelector((state)=> state.user.data.osid)
    const [ alertRegister, setAlertRegister ] = useState(false)
    useEffect(()=>{
        if(auth.currentUser){
            console.log(auth.currentUser)
            if(userId){
                onClose()
            }
            else {
                setAlertRegister(true)
            }
        }
    },[auth.currentUser, userId])
    const history = useHistory();
    const handleRegisterClick = (e) => {
        e.preventDefault();
        onClose()
        history.push("/vregistration")
    }

    return(
        // adds user login form
        <div className="wrapVolunteerLogin">
        <div className="volunteerLogin">
        <button className="btnCloseVLogin" onClick={onClose}>x</button>
        
        <div className="vloginForm row">

            {/* Add Login Form */}
            {!alertRegister && 
            <form className="vmenuLogin col-12 col-sm-10 offset-sm-1 mt-sm-5">
                <div className="vloginFormHead">
                    <div>
                        <div className="vgreetLogin " >Welcome Back!</div>
                        <div className="vtitleLogin" >Login</div>
                    </div>
                    {/* Logo */}
                    <div className="vsbLogo">
                        <img src={SBLogo} alt="BlueBirdLogo" width="120px" />
                    </div>
                </div>
   
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
            }

            {alertRegister && <div className="alertRegister">
            <p>You are logged in with email id <span>{auth.currentUser.email}</span>.</p> 
            <p>Complete registration to create account or nominate a need.</p>
            <button onClick={handleRegisterClick}>Click to Register</button>
            </div>} 
        </div>

       
        </div>
        </div>
    )
}

export default VolunteerLogin
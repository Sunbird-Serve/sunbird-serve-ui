import React,{useState} from 'react'
import {auth} from '../firebase'

const Login = () => {
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
        <div className='Login'>
            <div className="sbLogo"><img src={require("../clogo.jpg")} alt="BlueBirdLogo" /></div>
            <form className="menuLogin">
                <p className="greetLogin" >Welcome Back!</p>
                <p className="titleLogin" >Login</p>
                <label className="label"  >Email</label>
                <input className="input" type="text" name="email" value={email} onChange={changeHandler}/>
                <label className="label" >Password</label>
                <input className="input" type="password" name="password" value={password} onChange={changeHandler}/>
                <button className="btnLogin" type="login" onClick={logIn}>Login</button>
                <loption>OR</loption>
                <button className="btnLogin" type="login" onClick={signUp}>Signup</button>
            </form>
        </div>
    )
}

export default Login
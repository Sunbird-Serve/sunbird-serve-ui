import React, { useState } from "react";
import { auth, gprovider, fprovider } from "../../firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import SBLogo from "../../assets/sunbirdlogo.png";
import "./VolunteerSignup.css";
import { FcGoogle } from "react-icons/fc";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import { useHistory } from "react-router-dom";

const VolunteerSignup = ({ loginState, onClose }) => {
  const [error, setError] = useState("");
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const { email, password } = data;

  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const navigate = useHistory();

  const signUp = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
      .then(
        // user => console.log('User created')
        navigate.push("/vregistration")
      )
      .catch((err) => setError(err.code));
  };
  const signInWithGoogle = (e) => {
    e.preventDefault();
    signInWithPopup(auth, gprovider);
  };
  const signInWithFacebook = (e) => {
    e.preventDefault();
    signInWithPopup(auth, fprovider);
  };

  // if(!error){ navigate.push("/vregistration") }

  return (
    // adds user login form
    <div className="wrapVolunteerSignup">
      <div className="volunteerSignup1">
        <button className="btnCloseVLogin" onClick={onClose}>
          x
        </button>
        <div className="signupForm1 row">
          {/* Add Login Form */}
          <form className="menuSignup1 col-10 offset-sm-1">
            <div className="vsignupHead">
              <div>
                <div className="greetSignup1">Get Started!</div>
                <div className="titleSignup1">Create an Account</div>
              </div>
              {/* Logo */}
              <div className="sbLogo">
                <img src={SBLogo} alt="BlueBirdLogo" width="120px" />
              </div>
            </div>

            {/* user credentials */}
            <div className="unameSignup1">
              <label className="label">Email Id</label>
              <input
                className="input"
                type="text"
                name="email"
                value={email}
                placeholder="Enter your email address"
                onChange={changeHandler}
                autoComplete="off"
              />
            </div>
            <div className="pwdSignup1">
              <label className="label">Password </label>
              <input
                className="input"
                type="password"
                name="password"
                value={password}
                placeholder="Enter your password"
                onChange={changeHandler}
                autoComplete="off"
              />
            </div>
            {/* Login button*/}
            <div className="btnSignup1">
              <button type="signup" onClick={signUp}>
                Sign Up
              </button>
            </div>
            {/* <div className="gotoLogin"> */}
              {/* <span>Already have an account?</span> */}
              {/* <a href="#" onClick={() => loginState(false)}>Login! </a> */}
            {/* </div>
            <div className="hline">
              <hr />
              <span>or login with</span>
              <hr />
            </div> */}
            {/* Social Media Login*/}
            {/* <div className="btnSLogin">
              <button type="login" onClick={signInWithGoogle}>
                {" "}
                <i>
                  <FcGoogle />
                </i>
                Google
              </button>
              <button type="login" onClick={signInWithFacebook}>
                {" "}
                <i style={{ color: "#1877F2" }}>
                  {" "}
                  <FacebookRoundedIcon />
                </i>
                Facebook
              </button>
            </div> */}
            {/* Error message when credentials are wrong*/}
            {error && <div className="signupError">{error.slice(5)}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default VolunteerSignup;

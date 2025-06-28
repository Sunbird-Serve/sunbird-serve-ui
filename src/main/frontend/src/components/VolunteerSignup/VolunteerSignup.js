import React, { useState, useEffect } from "react";
import { auth, gprovider, fprovider } from "../../firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import SBLogo from "../../assets/sunbirdlogo.png";
import "./VolunteerSignup.css";
import { FcGoogle } from "react-icons/fc";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import { useHistory } from "react-router-dom";
import RegFormSuccess from "../RegFormSuccess/RegFormSuccess";
// import EmailValidation from "../CommonComponents/EmailValidation";

const VolunteerSignup = ({ loginState, onClose, RegistrationByAgencyId, regisRedirectUrl = "/vregistration", successRedirectionUrl = "/vneedtypes" }) => {
  const [error, setError] = useState("");
  const [regStatus, setRegStatus] = useState("");
  const [preFillEmail, setPreFillEmail] = useState("");
  // const [emailValidation, setEmailValidation] = useState({
  //   isValid: null,
  //   exists: false
  // });
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const { email, password } = data;

  useEffect(() => {
    const regEmail = localStorage.getItem("regEmail");
    if (regEmail) {
      setPreFillEmail(regEmail);
      setData(prevData => ({ ...prevData, email: regEmail }));
    }
  }, []);

  const changeHandler = (e) => {
    const { name, value } = e.target;
    console.log('Input change:', name, value); // Debug log
    setData(prevData => ({ ...prevData, [name]: value }));
    if (name === "email") {
      localStorage.setItem("regEmail", value);
    }
  };

  const navigate = useHistory();

  const signUp = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    
    // Proceed with Firebase registration - Firebase will handle duplicate checking
    createUserWithEmailAndPassword(auth, email, password)
      .then((user) => {
        if (RegistrationByAgencyId) {
          navigate.push(successRedirectionUrl)
        } else {
          navigate.push(regisRedirectUrl);
        }
      })
      .catch((err) => {
        if (err.code === 'auth/email-already-in-use') {
          setError("This email is already registered. Please use a different email or try logging in.");
        } else {
          setError(err.code);
        }
      });
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
    <>
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
                {/* Email validation temporarily disabled */}
              </div>
              <div className="pwdSignup1">
                <label className="label">
                  {RegistrationByAgencyId ? "Set Password" : "Password"}{" "}
                </label>
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
              {/*{ <div className="btnSLogin">
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
            </div> }*/}
              {/* Error message when credentials are wrong*/}
              {error && <div className="signupError">{error.slice(5)}</div>}
            </form>
          </div>
        </div>
      </div>

    </>
  );
};

export default VolunteerSignup;

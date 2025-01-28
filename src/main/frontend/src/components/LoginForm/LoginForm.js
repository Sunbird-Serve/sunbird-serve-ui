import React, { useState, useEffect } from "react";
import "./LoginForm.css";
import { auth, gprovider, fprovider } from "../../firebase";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import SBLogo from "../../assets/sunbirdlogo.png";
import { FcGoogle } from "react-icons/fc";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";

const LoginForm = ({ loginState, changePasswordRequest, passwordChanged }) => {
  const [error, setError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const { email, password } = data;

  useEffect(() => {
    setShowResetForm(changePasswordRequest);
  }, [changePasswordRequest]);

  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const logIn = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password).catch((err) =>
      setError(err.code)
    );
  };

  const signInWithGoogle = (e) => {
    e.preventDefault();
    signInWithPopup(auth, gprovider);
  };

  const signInWithFacebook = (e) => {
    e.preventDefault();
    signInWithPopup(auth, fprovider);
  };

  const handleGoto = (e) => {
    e.preventDefault();
    loginState(true);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    sendPasswordResetEmail(auth, resetEmail)
      .then(() => {
        setResetSent(true);
        setError("");
      })
      .catch((err) => setError(err.code));
  };

  const toggleResetForm = (e) => {
    e.preventDefault();
    setShowResetForm(!showResetForm);
    setResetSent(false);
    setError("");
  };

  const handlePasswordChange = () => {
    // Call the passwordChanged callback
    if (passwordChanged) {
      passwordChanged();
    }
  };
  return (
    <div className="loginForm row">
      {!showResetForm ? (
        <form className="menuLogin col-12 col-sm-7 offset-sm-1 mt-sm-5">
          <div className="greetLogin">Are you a Coordinator?</div>
          <div className="titleLogin">SERVE Login</div>

          <div className="unameLogin">
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
          <div className="pwdLogin">
            <label className="label">Password</label>
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

          <div className="btnLogin">
            <button type="submit" onClick={logIn}>
              Login
            </button>
          </div>

          <div className="resetPassword">
            <a href="#" onClick={toggleResetForm}>
              Forgot Password?
            </a>
          </div>

          {/*<div className="hline">
            <hr /> <span>or login with</span> <hr/>
          </div>*/}

          {/*<div className="btnSLogin">
            <button type="button" onClick={signInWithGoogle}>
              <i><FcGoogle /></i>Google
            </button>
            <button type="button" onClick={signInWithFacebook}>
              <i style={{color:'#1877F2'}}><FacebookRoundedIcon /></i>Facebook
            </button>
          </div>*/}

          {error && <div className="loginError">{error.slice(5)}</div>}
        </form>
      ) : (
        <form className="resetPasswordForm col-12 col-sm-7 offset-sm-1 mt-sm-5">
          <div
            className="titleLogin"
            style={{
              marginTop: changePasswordRequest ? "0px" : undefined,
            }}
          >
            Forgot/Reset Password
          </div>

          {!resetSent ? (
            <>
              <div className="unameLogin">
                <label className="label">Email Id</label>
                <input
                  className="input"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email address"
                  autoComplete="off"
                  required
                />
              </div>
              <div className="btnLogin">
                <button type="submit" onClick={handleResetPassword}>
                  Send Reset Email
                </button>
              </div>
            </>
          ) : (
            <div className="resetSuccessMessage">
              Password reset email sent. Check your inbox.
            </div>
          )}

          {changePasswordRequest ? (
            <div className="backToLogin">
              <a href="#" onClick={handlePasswordChange}>
                Back to Profile
              </a>
            </div>
          ) : (
            <div className="backToLogin">
              <a href="#" onClick={toggleResetForm}>
                Back to Login
              </a>
            </div>
          )}
          {error && <div className="loginError">{error.slice(5)}</div>}
        </form>
      )}
    </div>
  );
};

export default LoginForm;

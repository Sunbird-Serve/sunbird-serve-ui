import React from "react";
import formFailureImg from "./Illustration_Error.jpg";
import "./NoRoleAssigned.css";

const NoRoleAssigned = () => {
  return (
    <div className="errorPage">
      <div className="errorImg">
        <img
          className="errorLogo"
          src={formFailureImg}
          alt="errorLogo"
          width="40%"
        />
        <div className="errorComment">
          There is no role associated with your email ID yet.
        </div>
      </div>
      <div className="infoMsg">
        <div className="textInfo">
          If you are a volunteer, please register
          <span>
            {" "}
            <a href="/vregistration">here</a>
          </span>
        </div>
        <div className="textInfo">
          If you are a coordinator, kindly contact the admin by sending an email
          to
          <span>
            {" "}
            <a href="mailto:serveup.admin@serve.net.in">
              serveup.admin@serve.net.in
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default NoRoleAssigned;

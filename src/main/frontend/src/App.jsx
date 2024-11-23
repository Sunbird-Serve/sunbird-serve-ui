// import React, { useEffect, useState } from "react";
// import LoginPage from "./containers/LoginPage/LoginPage";
// import MainPage from "./containers/MainPage/MainPage";
// import ExplorePage from "./containers/ExplorePage/ExplorePage";
// import { auth } from "./firebase";
// import { useSelector, useDispatch } from 'react-redux';
// import { fetchUserByEmail } from './state/userSlice';
// import { fetchNeeds } from './state/needSlice';
// import { fetchNeedtypes } from './state/needtypeSlice';
// import { fetchNeedsByUid } from "./state/needByUidSlice";
// import { fetchEntities } from "./state/entitySlice";
// import { fetchUserList } from "./state/userListSlice";

// function App() {
//   const dispatch = useDispatch();

//   // AUTHENTICATION using firebase
//   const [presentUser, setPresentUser] = useState(null);
//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged((user) => {
//       if (user) {
//         setPresentUser({
//           uid: user.uid,    // this is firebase userId
//           email: user.email,
//         });
//       } else {
//         setPresentUser(null);
//       }
//     });

//     // Cleanup subscription on unmount
//     return () => unsubscribe();
//   }, []);

//   // UPDATE USER STATE based on authenticated email
//   const userDetails = useSelector((state) => state.user.data);
//   console.log(userDetails);

//   // Dispatch the user to store
//   useEffect(() => {
//     if (presentUser) {
//       const userEmail = presentUser.email.replace(/@/g, "%40") || '';
//       console.log(userEmail);
//       dispatch(fetchUserByEmail(userEmail));
//     }
//   }, [dispatch, presentUser]);

//   // UPDATE USERLIST
//   useEffect(() => {
//     dispatch(fetchUserList());
//   }, [dispatch]);

//   // UPDATE NEEDSBYID
//   useEffect(() => {
//     if (userDetails.osid) {
//       dispatch(fetchNeedsByUid(userDetails.osid));
//     }
//   }, [dispatch, userDetails]);

//   // UPDATE NEEDS
//   useEffect(() => {
//     dispatch(fetchNeeds());
//   }, [dispatch]);

//   // UPDATE NEEDTYPES
//   useEffect(() => {
//     dispatch(fetchNeedtypes());
//   }, [dispatch]);

//   // UPDATE ENTITIES
//   useEffect(() => {
//     dispatch(fetchEntities());
//   }, [dispatch]);

//   const [volunteer, setVolunteer] = useState(false);

//   const handleVolunteer = (value) => {
//     setVolunteer(value);
//   };

//   // Handle explore button click
//   if (volunteer) {
//     return <ExplorePage />;
//   }

//   // If user is logged in and userDetails are available
//   if (presentUser !== null && userDetails !== undefined) {
//     if (userDetails.role && userDetails.role.includes('Volunteer')) {
//       // User is a volunteer
//       return <ExplorePage />;
//     } else {
//       // Default: render MainPage for other roles
//       return <MainPage />;
//     }
//   }

//   // Default: render LoginPage if user is not logged in or userDetails are being fetched
//   return <LoginPage getVolunteerStatus={handleVolunteer} />;
// }

// export default App;



import React, { useEffect, useState } from "react";
import LoginPage from "./containers/LoginPage/LoginPage";
import MainPage from "./containers/MainPage/MainPage";
import ExplorePage from "./containers/ExplorePage/ExplorePage";
import { auth } from "./firebase";
import { signInWithCustomToken } from "firebase/auth";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserByEmail } from "./state/userSlice";
import { fetchNeeds } from "./state/needSlice";
import { fetchNeedtypes } from "./state/needtypeSlice";
import { fetchNeedsByUid } from "./state/needByUidSlice";
import { fetchEntities } from "./state/entitySlice";
import { fetchUserList } from "./state/userListSlice";
import "./index.css"
function App() {
  const dispatch = useDispatch();
  const [presentUser, setPresentUser] = useState(null); // Holds Firebase-authenticated user
  const [loading, setLoading] = useState(true); // Global loading state

  // Redux state for user details
  const userDetails = useSelector((state) => state.user.data);
  const userStatus = useSelector((state) => state.user.status); // loading, succeeded, failed
  const [volunteer, setVolunteer] = useState(false); // State for volunteer redirection

  // Token-Based Authentication Logic
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      signInWithCustomToken(auth, token)
        .then((userCredential) => {
          console.log("User authenticated with custom token:", userCredential.user);

          const email = userCredential.user?.uid; // Access email from the user object
          if (email) {
            setPresentUser({
              uid: userCredential.user.uid,
              email: email,
            });

            // Fetch user details
            const userEmail = email?.replace(/@/g, "%40");
            dispatch(fetchUserByEmail(userEmail));
          } else {
            console.error("Email is missing from the user object.");
          }
        })
        .catch((error) => {
          console.error("Authentication with custom token failed:", error);
          setPresentUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      // Handle case where no token is present
      setLoading(false);
    }
  }, [dispatch]);

  // Firebase Listener-Based Authentication Logic
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setPresentUser({
          uid: user.uid,
          email: user.email,
        });

        // Fetch user details for listener-based login
        const userEmail = user.email?.replace(/@/g, "%40");
        dispatch(fetchUserByEmail(userEmail));
      } else {
        setPresentUser(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);

  // Fetch user list after user details are loaded
  useEffect(() => {
    if (userStatus === "succeeded") {
      dispatch(fetchUserList());
    }
  }, [dispatch, userStatus]);

  // Fetch needs by UID when userDetails are populated
  useEffect(() => {
    if (userDetails.osid) {
      dispatch(fetchNeedsByUid(userDetails.osid));
    }
  }, [dispatch, userDetails]);

  // Fetch global needs
  useEffect(() => {
    dispatch(fetchNeeds());
  }, [dispatch]);

  // Fetch need types
  useEffect(() => {
    dispatch(fetchNeedtypes());
  }, [dispatch]);

  // Fetch entities
  useEffect(() => {
    dispatch(fetchEntities());
  }, [dispatch]);

  
  // Handle volunteer status change
  const handleVolunteer = (value) => {
    setVolunteer(value);
  };

  // Conditional rendering logic
  if (loading) {
    return <div>Loading...</div>;
  }
 // Handle explore button click
 if (volunteer) {
  return <ExplorePage />;
}
  if (presentUser === null) {
    return <LoginPage getVolunteerStatus={handleVolunteer} />;
  }

  if (userStatus === "loading") {
    return (<div className="loading-div">
      <div className="spiner"></div>
    </div>);
  }

  if (userDetails.role && userDetails.role.includes("Volunteer")) {
    return <ExplorePage />;
  }

  return <MainPage />;
}

export default App;


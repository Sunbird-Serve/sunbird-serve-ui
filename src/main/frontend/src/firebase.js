import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth'


const firebaseConfig = {
  apiKey: "AIzaSyCx1gTUeV3HNHqG8b4PiL-GYz1fwfK4lOA",
  authDomain: "serve-sandbox.firebaseapp.com",
  projectId: "serve-sandbox",
  storageBucket: "serve-sandbox.firebasestorage.app",
  messagingSenderId: "753259028832",
  appId: "1:753259028832:web:bc8331c33997e0fdcdfe05",
  measurementId: "G-NLWWQ8YFDQ"
};
  
const app = initializeApp(firebaseConfig);  //initialize firebase app at server

//make references to auth
const auth = getAuth(app);  //initialize authentication service
const gprovider = new GoogleAuthProvider();
const fprovider = new FacebookAuthProvider();

export { auth, gprovider, fprovider };

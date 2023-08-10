import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDfCZlKwxq2QaZFwqPhezTLxsyReOGCdFo",
  authDomain: "vidyaloka-40f2c.firebaseapp.com",
  projectId: "vidyaloka-40f2c",
  storageBucket: "vidyaloka-40f2c.appspot.com",
  messagingSenderId: "657062679030",
  appId: "1:657062679030:web:759dd0df4895c1882cf7d7"
};
  
const app = initializeApp(firebaseConfig);  //initialize firebase app at server

//make references to auth
const auth = getAuth(app);  //initialize authentication service
const gprovider = new GoogleAuthProvider();
const fprovider = new FacebookAuthProvider();

export { auth, gprovider, fprovider };
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth'

  const firebaseConfig = {
    apiKey: "AIzaSyCkDO12Oodf0VUHaqBts81rzFXoAv05sW4",
    authDomain: "up-project-serve.firebaseapp.com",
    projectId: "up-project-serve",
    storageBucket: "up-project-serve.appspot.com",
    messagingSenderId: "38984238125",
    appId: "1:38984238125:web:e658687314c446df1be4a4",
    measurementId: "G-FQJ6NS4LKL"
  };
  
const app = initializeApp(firebaseConfig);  //initialize firebase app at server

//make references to auth
const auth = getAuth(app);  //initialize authentication service
const gprovider = new GoogleAuthProvider();
const fprovider = new FacebookAuthProvider();

export { auth, gprovider, fprovider };

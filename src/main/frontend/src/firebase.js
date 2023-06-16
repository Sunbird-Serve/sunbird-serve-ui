import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyDfCZlKwxq2QaZFwqPhezTLxsyReOGCdFo",
    authDomain: "vidyaloka-40f2c.firebaseapp.com",
    projectId: "vidyaloka-40f2c",
    storageBucket: "vidyaloka-40f2c.appspot.com",
    messagingSenderId: "657062679030",
    appId: "1:657062679030:web:759dd0df4895c1882cf7d7"
  };
  
  // Initialize Firebase
  const firebaseApp = firebase.initializeApp(firebaseConfig);

  const db = firebase.firestore();
  const auth = firebase.auth();

  export {auth, db};
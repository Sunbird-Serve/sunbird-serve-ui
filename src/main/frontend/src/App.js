import './App.css';
import React,{useEffect,useState} from 'react'
import PageLogin from './login/PageLogin'
import Main from './components/Main' 
import {auth} from './firebase'


function App() {
  const [presentUser,setPresentUser] = useState(null);
  useEffect(() => {
    auth.onAuthStateChanged(user => {
      if(user){
        setPresentUser({
          uid: user.uid,
          email: user.email
        })
      } else {
        setPresentUser(null)
      }
    })
  },[]);
  return (
    <div className="App">
      {presentUser ? <Main /> : <PageLogin />}
    </div>
  );
}

export default App;

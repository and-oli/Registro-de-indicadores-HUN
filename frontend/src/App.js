import React from 'react';
import './App.css';
import SignIn from './Shared/SignIn'
import Navigation from './Shared/Navigation'

function App() {
  return (
    <div className="App">
      {
        (localStorage.getItem("HUNToken")) ?
          <Navigation />:
          <SignIn /> 
      }
    </div>
  );
}

export default App;

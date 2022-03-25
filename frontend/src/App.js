import React from 'react'
import './App.css';
import { SearchPhotos } from "./searchPhotos"


function App() {
  
  return (    
    <div className="App">
      <div className="container">
        <h1 className="title">Photo Search with Voice</h1>
        <SearchPhotos />
      </div>
    </div>
  );
}

export default App;

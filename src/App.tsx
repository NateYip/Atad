import './App.css';
import BarChart from './components/barChart'
import React, { useEffect } from 'react'
import { WebGLDebugUtils } from './common/utils/glUtils';
function App() {
  useEffect(() =>{
    WebGLDebugUtils();
  })
  return (
    <div className="App">
      <BarChart/>
    </div>
  );
}

export default App;

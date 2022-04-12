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
      <BarChart
        data = {
          [10,22,12,10,13,20,8]
        }
      />
    </div>
  );
}

export default App;

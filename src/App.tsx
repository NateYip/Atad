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
          [6,5 ,7,12,0,5,7]
        }
      />
    </div>
  );
}

export default App;

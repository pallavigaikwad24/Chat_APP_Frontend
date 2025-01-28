import RoutingWay from './RoutingWay';
import { createContext, useState } from 'react';

export const ContextComponent = createContext();

function App() {
  const [display, setDisplay] = useState("none");
  const [comment, setComment] = useState(null);

  return (
    <div>
    <ContextComponent.Provider value = {{display, setDisplay, comment, setComment}} >
      <RoutingWay/>
    </ContextComponent.Provider>

    </div>
  )
}

export default App;
import { useState } from "react";
import {Route, Link, Routes} from 'react-router-dom';
import Game from './components/Game';
import Home from "./components/Home";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
    <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/Game' element={<Game/>} />
      </Routes>
    </>
  );
}

export default App;

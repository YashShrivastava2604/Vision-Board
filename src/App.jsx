import { useState } from "react";
import PasteHome from "./components/Paste/PasteHome"
import TodoHome from "./components/Todo/TodoHome"
import ScribbleHome from "./components/Scribble/ScribbleHome"
import { BrowserRouter,createBrowserRouter,Route,Routes,NavLink } from "react-router-dom";
import Navbar from "./components/Navbar";
import Choice from "./components/Choice";
import ViewPaste from "./components/Paste/ViewPaste";
import { NavbarProvider } from './redux/NavbarContext';
export default function App() {
  
  

  return (
    <>

    <NavbarProvider>  
      <BrowserRouter>   
          <Routes>
            <Route path="/" element={<Choice/>}/>
            <Route path="/paste" element={<div className="flex w-full">
              <Navbar/>
              <PasteHome />
            </div>
            } />
            <Route path="/paste/:id" element={<div className="flex w-full">
              <Navbar/>
              <ViewPaste />
            </div>
            } />
            <Route path="/todo" element={<div className="flex w-full">
              <Navbar/>
              <TodoHome />
            </div>
            }  />
            <Route path="/scribble" element={<div className="flex w-full">
              <Navbar/>
              <ScribbleHome />
            </div>
            }  />
          </Routes>
      </BrowserRouter>
    </NavbarProvider>
    </>
  );
}

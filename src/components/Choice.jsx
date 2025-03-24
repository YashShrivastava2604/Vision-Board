import React from "react";
import { motion } from "framer-motion"; 
import { NavLink } from "react-router";
import pasteImage from '../assets/pasteImage.png'
import todoImage from '../assets/todoImage.png'
import scribbleImage from '../assets/scribbleImage.png'
import '../App.css'

const App = () => {
    
  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="relative flex h-full w-full flex-wrap justify-around items-center cursor-pointer gap-1">
        
      <NavLink to='/paste'>
            <motion.div
                className="flex justify-center items-center relative h-[12rem] w-[24rem] bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded overflow-hidden group"
                whileHover={{ y: -5 }}  
                whileTap={{ scale: 0.93 }}
            >
                <motion.span className="text-lg font-bold transition-all duration-700 group-hover:-translate-y-[12rem]">
                Paste App
                </motion.span>

                {/* Overlay div that slides up from bottom but stays inside the parent */}
                <motion.div 
                className="absolute bottom-0 flex justify-center items-center h-full w-full opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 "
                >
                  
                    <img className= "bg-gray-50 h-full w-fit " src={pasteImage} alt="Paste Image" />
                 
                </motion.div>
            </motion.div>

            
        </NavLink>



        <NavLink to='/todo'>
            <motion.div
                className="flex justify-center items-center relative h-[12rem] w-[24rem] bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded overflow-hidden group"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.93 }}
            >
                <motion.span className="text-lg font-bold transition-all duration-700 group-hover:-translate-y-[12rem]">
                To Do App
                </motion.span>

                {/* Overlay div that slides up from bottom but stays inside the parent */}
                <motion.div 
                className="absolute bottom-0 flex justify-center items-center h-full w-full opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700"
                >
                <img className= "bg-gray-50 h-full w-full " src={todoImage } alt="Todo Image" />
                </motion.div>
            </motion.div>
        </NavLink>


        <NavLink to='/scribble'>
            <motion.div
                className="flex justify-center items-center relative h-[12rem] w-[24rem] bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700 rounded overflow-hidden group"
                whileHover={{ y: -5 }} 
                whileTap={{ scale: 0.93 }}
            >
                <motion.span className="text-lg font-bold transition-all duration-700 group-hover:-translate-y-[12rem]">
                Scribble App
                </motion.span>

                
                <motion.div 
                className="absolute bottom-0 flex justify-center items-center h-full w-full opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700"
                >
                <img className= "bg-gray-50 h-full w-full " src={scribbleImage } alt="Scribble Image" />
                </motion.div>
            </motion.div>
        </NavLink>
        
      </div>
    </div>
  );
};

export default App;
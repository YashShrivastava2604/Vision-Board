import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiClipboard, FiCheckSquare, FiEdit2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { NavbarContext } from '../redux/NavbarContext';

const Navbar = () => {
  const { collapsed, setCollapsed } = useContext(NavbarContext);

  return (
    <div className={`bg-gray-900  text-white shadow-lg transition-all duration-300 h-screen fixed top-0 left-0 ${collapsed ? 'w-[3.5rem]' : 'w-56'} z-10000`}>
      {/* Toggle Button */}
      <div 
        className="absolute top-[48%] right-[-14px] bg-gray-700 text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-600 transition"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
      </div>

      <NavLink to="/" className="flex items-center py-6 px-4 border-b border-gray-700">
        <FiHome size={24} />
        {!collapsed && <span className="ml-3 text-lg font-semibold   transition-all duration-300">Home</span>}
      </NavLink>

      {/* Navigation Items */}
      <div className="flex flex-col gap-3 py-4 transition-all duration-300">
        <NavLink to="/paste" className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition">
          <FiClipboard size={24}/>
          <span 
            className={`
              overflow-hidden whitespace-nowrap transition-all duration-300
              ${collapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-xs ml-3'}
            `}
          >
            Paste
          </span>
        </NavLink>
        <NavLink to="/todo" className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition">
          <FiCheckSquare size={24}/>
          <span 
            className={`
              overflow-hidden whitespace-nowrap transition-all duration-300
              ${collapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-xs ml-3'}
            `}
          >
            Todo
          </span>
        </NavLink>
        <NavLink to="/scribble" className="flex items-center gap-3 p-3 hover:bg-gray-700 rounded-lg transition">
          <FiEdit2 size={24}/>
          <span 
            className={`
              overflow-hidden whitespace-nowrap transition-all duration-300
              ${collapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-xs ml-3'}
            `}
          >
            Scribble
          </span>
        </NavLink>
      </div>
    </div>
  );
};

export default Navbar;

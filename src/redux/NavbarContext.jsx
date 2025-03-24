import React, { createContext, useState } from 'react';

export const NavbarContext = createContext();

export const NavbarProvider = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <NavbarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </NavbarContext.Provider>
  );
};

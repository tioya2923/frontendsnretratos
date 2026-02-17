
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    }
  }, [token]);

  useEffect(() => {
    if (userName) {
      localStorage.setItem('userName', userName);
    } else {
      localStorage.removeItem('userName');
    }
  }, [userName]);

  const login = (name, tokenValue) => {
    setUserName(name);
    setToken(tokenValue);
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUserName('');
    setToken('');
    setIsAuthenticated(false);
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
  };

  return (
    <UserContext.Provider value={{ userName, setUserName, token, setToken, isAuthenticated, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

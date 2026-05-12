
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const BACKEND = 'https://snref-backend-8d85ffa999cd.herokuapp.com';

export const UserProvider = ({ children }) => {
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [unreadMessages, setUnreadMessages] = useState(0);

  const tokenRef = useRef(token);
  useEffect(() => { tokenRef.current = token; }, [token]);

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
    setUnreadMessages(0);
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
  };

  const refreshUnreadMessages = useCallback(async () => {
    if (!tokenRef.current) return;
    try {
      const res = await fetch(`${BACKEND}/components/mensagens.php?nao_lidas=1&_=${Date.now()}`, {
        headers: { Authorization: `Bearer ${tokenRef.current}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setUnreadMessages(data.count ?? 0);
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadMessages(0);
      return;
    }
    refreshUnreadMessages();
    const interval = setInterval(() => {
      if (!document.hidden) refreshUnreadMessages();
    }, 12000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUnreadMessages]);

  return (
    <UserContext.Provider value={{
      userName, setUserName, token, setToken, isAuthenticated, login, logout,
      unreadMessages, refreshUnreadMessages
    }}>
      {children}
    </UserContext.Provider>
  );
};

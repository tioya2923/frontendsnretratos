
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const BACKEND = 'https://snref-backend-8d85ffa999cd.herokuapp.com';

export const UserProvider = ({ children }) => {
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [utilizadores, setUtilizadores] = useState([]);
  const [loadingUtilizadores, setLoadingUtilizadores] = useState(!!localStorage.getItem('token'));
  const [utilizadoresFailed, setUtilizadoresFailed] = useState(false);

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
    setUtilizadores([]);
    setLoadingUtilizadores(false);
    setUtilizadoresFailed(false);
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

  // Fetch user list with up to 3 attempts, 2 s apart on failure
  const fetchUtilizadores = useCallback(async () => {
    if (!tokenRef.current) { setLoadingUtilizadores(false); return; }
    setLoadingUtilizadores(true);
    setUtilizadoresFailed(false);
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 2000));
      try {
        const res = await fetch(`${BACKEND}/components/mensagens.php?utilizadores=1&_=${Date.now()}`, {
          headers: { Authorization: `Bearer ${tokenRef.current}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data)) throw new Error('Resposta inválida');
        setUtilizadores(data);
        setUtilizadoresFailed(false);
        setLoadingUtilizadores(false);
        return;
      } catch (_) {}
    }
    setUtilizadoresFailed(true);
    setLoadingUtilizadores(false);
  }, []);

  // Badge polling
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

  // User list: fetch once, 1 s after auth (badge poll completes first)
  useEffect(() => {
    if (!isAuthenticated) {
      setUtilizadores([]);
      setLoadingUtilizadores(false);
      setUtilizadoresFailed(false);
      return;
    }
    setLoadingUtilizadores(true);
    const t = setTimeout(fetchUtilizadores, 1000);
    return () => clearTimeout(t);
  }, [isAuthenticated, fetchUtilizadores]);

  return (
    <UserContext.Provider value={{
      userName, setUserName, token, setToken, isAuthenticated, login, logout,
      unreadMessages, refreshUnreadMessages,
      utilizadores, loadingUtilizadores, utilizadoresFailed, refetchUtilizadores: fetchUtilizadores
    }}>
      {children}
    </UserContext.Provider>
  );
};

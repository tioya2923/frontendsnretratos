
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

  const tokenRef  = useRef(token);
  const logoutRef = useRef(null);
  useEffect(() => { tokenRef.current = token; }, [token]);

  // Guards to prevent concurrent in-flight requests
  const badgePollInFlightRef = useRef(false);
  const userListFetchedRef   = useRef(false);

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

  // Keep logoutRef current so stable useCallback functions can call logout()
  const logout = () => {
    setUserName('');
    setToken('');
    setIsAuthenticated(false);
    setUnreadMessages(0);
    setUtilizadores([]);
    setLoadingUtilizadores(false);
    setUtilizadoresFailed(false);
    badgePollInFlightRef.current = false;
    userListFetchedRef.current = false;
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
  };
  logoutRef.current = logout;

  const login = (name, tokenValue) => {
    setUserName(name);
    setToken(tokenValue);
    setIsAuthenticated(true);
  };

  // Fetch user list — up to 3 attempts, 2 s apart on failure
  const fetchUtilizadores = useCallback(async () => {
    if (!tokenRef.current) { setLoadingUtilizadores(false); return; }
    setLoadingUtilizadores(true);
    setUtilizadoresFailed(false);
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) await new Promise(r => setTimeout(r, 2000));
      try {
        const res = await fetch(
          `${BACKEND}/components/mensagens.php?utilizadores=1&_=${Date.now()}`,
          { headers: { Authorization: `Bearer ${tokenRef.current}` } }
        );
        if (res.status === 401) { logoutRef.current?.(); return; }
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

  // Badge poll — guards against concurrent calls; chains user list fetch on first success
  const refreshUnreadMessages = useCallback(async () => {
    if (!tokenRef.current) return;
    if (badgePollInFlightRef.current) return; // skip if previous poll still in flight
    badgePollInFlightRef.current = true;
    try {
      const res = await fetch(
        `${BACKEND}/components/mensagens.php?nao_lidas=1&_=${Date.now()}`,
        { headers: { Authorization: `Bearer ${tokenRef.current}` } }
      );
      if (res.status === 401) { logoutRef.current?.(); return; }
      if (!res.ok) return;
      const data = await res.json();
      setUnreadMessages(data.count ?? 0);
      // Fetch user list after first badge poll — guarantees the dyno is awake and idle
      if (!userListFetchedRef.current) {
        userListFetchedRef.current = true;
        fetchUtilizadores();
      }
    } catch (_) {}
    finally {
      badgePollInFlightRef.current = false;
    }
  }, [fetchUtilizadores]);

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

  // User list state — actual fetch is chained from refreshUnreadMessages on first success
  useEffect(() => {
    if (!isAuthenticated) {
      userListFetchedRef.current = false;
      badgePollInFlightRef.current = false;
      setUtilizadores([]);
      setLoadingUtilizadores(false);
      setUtilizadoresFailed(false);
      return;
    }
    setLoadingUtilizadores(true);
  }, [isAuthenticated]);

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

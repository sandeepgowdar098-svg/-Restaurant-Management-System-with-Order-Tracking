import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('restaurant_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user);
      setToken(parsed.token);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    const data = res.data;
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('restaurant_user', JSON.stringify(data));
    return data;
  };

  const register = async (name, email, password, avatar = '') => {
    const res = await API.post('/auth/register', { name, email, password, avatar });
    const data = res.data;
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('restaurant_user', JSON.stringify(data));
    return data;
  };

  const googleLogin = async (tokenId) => {
    const res = await API.post('/auth/google-login', { tokenId });
    const data = res.data;
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('restaurant_user', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('restaurant_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // 1. Giải mã tạm thời để hiện UI nhanh (Hỗ trợ tiếng Việt UTF-8)
          const base64 = token.split('.')[1];
          const payload = JSON.parse(
            decodeURIComponent(
              atob(base64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            )
          );
          setUser({
            id: payload.id,
            fullName: payload.fullName,
            role: payload.role,
            gender: payload.gender
          });

          // 2. Lấy dữ liệu "tươi" nhất từ Database
          const { data } = await api.get('/users/profile');
          setUser(data);
        } catch (err) {
          console.error('Auth Init Error:', err);
          // Nếu token hết hạn hoặc lỗi, logout
          if (err.response?.status === 401) logout();
        }
      }
      setLoading(false);
    };
    
    initAuth();
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const updateAuth = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, updateAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

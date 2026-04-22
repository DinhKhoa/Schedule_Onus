import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        // Decode JWT payload
        // Use decodeURIComponent to properly handle UTF-8 Vietnamese characters
        const parts = token.split('.');
        if (parts.length !== 3) throw new Error('Invalid token structure');

        const base64 = parts[1];
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
          hoTen: payload.hoTen,
          vaiTro: payload.vaiTro,
          taiKhoan: payload.taiKhoan,
          gioiTinh: payload.gioiTinh
        });
      } catch (err) {
        console.error('Auth Context Token Error:', err);
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

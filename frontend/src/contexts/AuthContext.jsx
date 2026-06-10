import { API_URL } from '@/config';
import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    checkAuth();
  }, []);

  // Khi user thay đổi, cập nhật ngôn ngữ trong i18n (nếu chưa có ngôn ngữ được chọn từ user)
  useEffect(() => {
    if (user && user.language) {
      const langCode = user.language?.toLowerCase() === 'vi' ? 'vi' : 'en';
      const savedLang = localStorage.getItem('i18nextLng');
      // Chỉ update nếu chưa có language được lưu từ user selection
      if (!savedLang) {
        // Await changeLanguage vì nó là async
        i18n.changeLanguage(langCode).then(() => {
          localStorage.setItem('i18nextLng', langCode);
        });
      }
    }
  }, [user, i18n]);

  const checkAuth = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (err) {
      console.error("Auth check failed:", err);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password, rememberMe = false, otp = undefined) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
        otp
      });

      const { token, user } = response.data;

      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }

      setUser(user);
      return { error: null, user };
    } catch (err) {
      console.error("Login failed:", err);
      return {
        error: {
          message: err.response?.data?.message || 'Đăng nhập thất bại'
        }
      };
    }
  };

  const signUp = async (email, password, fullName, userType) => {
    try {
      // Map frontend role to backend role
      // candidate -> JOB_SEEKER
      // employer -> EMPLOYER
      const role = userType === 'candidate' ? 'JOB_SEEKER' : 'EMPLOYER';

      const response = await axios.post(`${API_URL}/api/auth/register`, {
        email,
        password,
        name: fullName,
        role
      });

      // Backend returns { message, userId, email } but NO token immediately (needs OTP)
      return { error: null, data: response.data };
    } catch (err) {
      console.error("Register failed:", err);
      return {
        error: {
          message: err.response?.data?.message || 'Đăng ký thất bại'
        }
      };
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (err) {
      console.error('Refresh user failed:', err);
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

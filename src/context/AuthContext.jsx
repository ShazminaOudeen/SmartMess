import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api/auth';

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    // Create axios instance with auth header
    const api = useCallback(() => {
        const instance = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (token) {
            instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        return instance;
    }, [token]);

    // Load user from token on mount
    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const res = await api().get('/profile');
                    if (res.data.success) {
                        setUser(res.data.user);
                    } else {
                        logout();
                    }
                } catch {
                    logout();
                }
            }
            setLoading(false);
        };
        loadUser();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const login = async (email, password, role) => {
        const res = await api().post('/login', { email, password, role });
        if (res.data.success) {
            setToken(res.data.token);
            setUser(res.data.user);
            localStorage.setItem('token', res.data.token);
        }
        return res.data;
    };

    const register = async (userData) => {
        const res = await api().post('/register', userData);
        if (res.data.success && res.data.token) {
            setToken(res.data.token);
            setUser(res.data.user);
            localStorage.setItem('token', res.data.token);
        }
        return res.data;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
    };

    const updateProfile = async (profileData) => {
        const res = await api().put('/profile', profileData);
        if (res.data.success) {
            setUser(res.data.user);
        }
        return res.data;
    };

    const changePassword = async (currentPassword, newPassword) => {
        const res = await api().put('/change-password', { currentPassword, newPassword });
        return res.data;
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        isAuthenticated: !!token && !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

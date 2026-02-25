import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API = '/api';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('ud_token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchMe();
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line
    }, []);

    const fetchMe = async () => {
        try {
            const res = await fetch(`${API}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.user);
            } else {
                logout();
            }
        } catch {
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('ud_token', data.token);
        }
        return data;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('ud_token');
    };

    const apiFetch = async (url, options = {}) => {
        const res = await fetch(`${API}${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...(options.headers || {})
            }
        });
        return res.json();
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, apiFetch, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

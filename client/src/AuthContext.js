import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(null);

    const login = (token) => {
        const tokenExpiry = JSON.parse(atob(token.split('.')[1])).exp * 1000;
        localStorage.setItem('token', token);
        localStorage.setItem('tokenExpiry', tokenExpiry);
        setToken(token);
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
        setToken(null);
        setIsLoggedIn(false);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        if (token && tokenExpiry && Date.now() < tokenExpiry) {
            setToken(token);
            setIsLoggedIn(true);
        } else {
            logout();  // Κάνουμε logout αν το token είναι άκυρο ή έχει λήξει
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, token }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

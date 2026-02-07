import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
    user: string | null;
    token: string | null;
    login: (token: string, username: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<string | null>(localStorage.getItem('user'));
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', user);
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const login = (newToken: string, username: string) => {
        setToken(newToken);
        setUser(username);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

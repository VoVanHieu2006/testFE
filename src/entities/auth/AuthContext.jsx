import React, { createContext, useState, useEffect } from 'react';
import { logout as logoutApi } from '../../share/api/authApi';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [currentTenant, setCurrentTenant] = useState(null);  
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            const storedCurrentTenant = localStorage.getItem('currentTenant');
            
            // Kiểm tra token có tồn tại không
            if (storedToken) {
                setToken(storedToken);
            }

            // Parse user safely
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                } catch (parseErr) {
                    console.error('Failed to parse stored user:', parseErr);
                    // Data lỗi → xóa localStorage
                    localStorage.removeItem('user');
                }
            }

            // Parse currentTenant safely
            if (storedCurrentTenant) {
                try {
                    const parsedTenant = JSON.parse(storedCurrentTenant);
                    setCurrentTenant(parsedTenant);
                } catch (parseErr) {
                    console.error('Failed to parse stored currentTenant:', parseErr);
                    // Data lỗi → xóa localStorage
                    localStorage.removeItem('currentTenant');
                }
            }
        } catch (err) {
            console.error('Error loading from localStorage:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Normalize data 
    const normalizeUserData = (data) => {
        let tenants = [];

        if (data.tenants && Array.isArray(data.tenants)) {
            tenants = data.tenants;
        }
        else if (data.tenantId && data.subdomain) {
            tenants = [{ tenantId: data.tenantId, subdomain: data.subdomain }];
        }

        return {
            userId: data.userId,
            email: data.email,
            role: data.role,
            tenants 
        };
    };

    // LOGOUT
    const logout = async () => {
        try {
            await logoutApi();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setUser(null);
            setToken(null);
            setCurrentTenant(null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('currentTenant');
        }
    };

    // LOGIN
    const login = (data) => {
        try {
            const normalizedUser = normalizeUserData(data);
            setUser(normalizedUser);
            setToken(data.token);

            if (normalizedUser.tenants.length === 1) {
                const firstTenant = normalizedUser.tenants[0];
                setCurrentTenant(firstTenant);
                localStorage.setItem('currentTenant', JSON.stringify(firstTenant));
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(normalizedUser));

       

        } catch (err) {
            console.error('Login error:', err);
            setError('Có lỗi xảy ra khi lưu thông tin');
        }
    };

    // REGISTER MERCHANT
    const register = (data) => {
        try {
            const normalizedUser = normalizeUserData(data);
            setUser(normalizedUser);
            setToken(data.token);

            const firstTenant = normalizedUser.tenants[0];
            setCurrentTenant(firstTenant);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(normalizedUser));
            localStorage.setItem('currentTenant', JSON.stringify(firstTenant));
        } catch (err) {
            console.error('Register error:', err);
            setError('Có lỗi xảy ra khi lưu thông tin');
        }
    };

    // Switch between tenants
    const switchTenant = (tenantId) => {
        if (!user || !user.tenants) return;

        const selectedTenant = user.tenants.find(t => t.tenantId === tenantId);
        if (selectedTenant) {
            setCurrentTenant(selectedTenant);
            localStorage.setItem('currentTenant', JSON.stringify(selectedTenant));
        }
    };

    const value = {
        user,
        token,
        currentTenant,  
        isLoading,
        error,
        login,
        logout,
        register,
        switchTenant,  
        isAuthenticated: !!token && !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
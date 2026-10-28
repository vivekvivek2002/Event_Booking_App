import { createContext, useState } from 'react';
import api from '../utils/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) return null;

        try {
            return JSON.parse(userInfo);
        } catch {
            localStorage.removeItem('userInfo');
            localStorage.removeItem('token');
            return null;
        }
    });

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            const responseData = error.response?.data;
            if (responseData?.needsVerification) throw responseData;
            throw responseData?.error || responseData?.message || 'Login failed';
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            return data; // Returns { message, email }
        } catch (error) {
            throw error.response?.data?.error || error.response?.data?.message || 'Registration failed';
        }
    };

    const verifyOTP = async (email, otp) => {
        try {
            const { data } = await api.post('/auth/verify-otp', { email, otp });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            throw error.response?.data?.error || error.response?.data?.message || 'OTP verification failed';
        }
    };

    const forgotPassword = async (email) => {
        try {
            const { data } = await api.post('/auth/forgot-password', { email });
            return data;
        } catch (error) {
            throw error.response?.data?.error || error.response?.data?.message || 'Unable to send reset OTP';
        }
    };

    const resetPassword = async (email, otp, password) => {
        try {
            const { data } = await api.post('/auth/reset-password', { email, otp, password });
            return data;
        } catch (error) {
            throw error.response?.data?.error || error.response?.data?.message || 'Password reset failed';
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, verifyOTP, forgotPassword, resetPassword, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

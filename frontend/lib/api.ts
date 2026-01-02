import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
});

// Auth API
export const signup = async (email: string, password: string) => {
  const response = await api.post('/api/auth/signup', { email, password });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

// Business API
export const getBusinessConfig = async (token: string) => {
  const response = await api.get('/api/business/config', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateBusinessConfig = async (
  token: string,
  allowedOrigins: string[],
  callbackUrl: string | null
) => {
  const response = await api.put(
    '/api/business/config',
    { allowedOrigins, callbackUrl },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

// OTP API
export const sendOTP = async (email: string, publicKey: string) => {
  const response = await api.post('/api/otp/send', { email, publicKey });
  return response.data;
};

export const verifyOTP = async (email: string, code: string, publicKey: string) => {
  const response = await api.post('/api/otp/verify', { email, code, publicKey });
  return response.data;
};

import { axiosClient } from './axiosClient';

// Merchant Register
export const merchantRegister = async (data) => {
    

    return axiosClient.post('/auth/merchant/register', data);
};

export const merchantLogin = async (email, password) => {
    
    return (await axiosClient.post('/auth/merchant/login', { email, password })).data;
};

// Get Current User
export const getMe = async () => {
    
    return (await axiosClient.get('/auth/me')).data;
};

// Logout
export const logout = async () => {
    
    return axiosClient.post('/auth/logout');
    
};

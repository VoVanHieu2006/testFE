import { axiosClient } from './axiosClient';

export const getMyTenants = async () => {
    const res = await axiosClient.get('/tenants/me');
    return res.data;
};

export const getTenantById = async (id) => {
    const res = await axiosClient.get(`/tenants/${id}`);
    return res.data;
};

export const createTenant = async (data) => {
    const res = await axiosClient.post('/tenants', data);
    return res.data;
};

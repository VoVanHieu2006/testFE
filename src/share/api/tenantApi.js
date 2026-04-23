import { axiosClient } from './axiosClient';

export const getMyTenants = async () => {
    const res = await axiosClient.get('/tenants/me');
    return res.data;
};

export const getTenantById = async (id) => {
    const res = await axiosClient.get(`/tenants/${id}`);
    return res.data;
};

export const getTenantBySubdomain = async (subdomain) => {
    const res = await axiosClient.get(`/tenants/subdomain/${subdomain}`);
    return res.data;
};

export const createTenant = async (data) => {
    const res = await axiosClient.post('/tenants', data);
    return res.data;
};

export const deleteTenant = async (id) => {
    const res = await axiosClient.delete(`/tenants/${id}`);
    return res.data;
};

export const patchTenantTheme = async (subdomain, themeConfig) => {
    const res = await axiosClient.patch(`/Tenants/subdomain/${subdomain}/theme`, themeConfig);
    return res.data;
};

export const patchTenantContent = async (subdomain, contentConfig) => {
    const res = await axiosClient.patch(`/Tenants/subdomain/${subdomain}/content`, contentConfig);
    return res.data;
};

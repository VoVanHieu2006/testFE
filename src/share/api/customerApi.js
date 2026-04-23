import { axiosClient } from './axiosClient';

export const getCustomers = async (tenantId, params = {}) => {
    const res = await axiosClient.get(`/tenants/${tenantId}/customers`, { params });
    return res.data;
};

export const getCustomerById = async (tenantId, customerId) => {
    const res = await axiosClient.get(`/tenants/${tenantId}/customers/${customerId}`);
    return res.data;
};

import { axiosClient } from './axiosClient';

export const getCategories = async (tenantId) => {
    const res = await axiosClient.get(`/tenants/${tenantId}/categories`);
    return res.data;
};

export const createCategory = async (tenantId, data) => {
    const res = await axiosClient.post(`/tenants/${tenantId}/categories`, data);
    return res.data;
};

export const updateCategory = async (tenantId, id, data) => {
    const res = await axiosClient.put(`/tenants/${tenantId}/categories/${id}`, data);
    return res.data;
};

export const deleteCategory = async (tenantId, id) => {
    const res = await axiosClient.delete(`/tenants/${tenantId}/categories/${id}`);
    return res.data;
};

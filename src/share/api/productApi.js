import { axiosClient } from './axiosClient';

export const getProducts = async (tenantId, params = {}) => {
    const res = await axiosClient.get(`/tenants/${tenantId}/products`, { params });
    return res.data;
};

export const getProductById = async (tenantId, id) => {
    const res = await axiosClient.get(`/tenants/${tenantId}/products/${id}`);
    return res.data;
};

export const createProduct = async (tenantId, data) => {
    const res = await axiosClient.post(`/tenants/${tenantId}/products`, data);
    return res.data;
};

export const updateProduct = async (tenantId, id, data) => {
    const res = await axiosClient.put(`/tenants/${tenantId}/products/${id}`, data);
    return res.data;
};

export const deleteProduct = async (tenantId, id) => {
    const res = await axiosClient.delete(`/tenants/${tenantId}/products/${id}`);
    return res.data;
};

export const getProductSkus = async (tenantId, productId) => {
    const res = await axiosClient.get(`/tenants/${tenantId}/products/${productId}/skus`);
    return res.data;
};

export const createSku = async (tenantId, productId, data) => {
    const res = await axiosClient.post(`/tenants/${tenantId}/products/${productId}/skus`, data);
    return res.data;
};

export const updateSku = async (tenantId, productId, skuId, data) => {
    const res = await axiosClient.put(`/tenants/${tenantId}/products/${productId}/skus/${skuId}`, data);
    return res.data;
};

export const deleteSku = async (tenantId, productId, skuId) => {
    const res = await axiosClient.delete(`/tenants/${tenantId}/products/${productId}/skus/${skuId}`);
    return res.data;
};

import { axiosClient } from './axiosClient';

export const getOrders = async (tenantId, params = {}) => {
    const res = await axiosClient.get(`/tenants/${tenantId}/orders`, { params });
    return res.data;
};

export const getOrderById = async (tenantId, orderId) => {
    const res = await axiosClient.get(`/tenants/${tenantId}/orders/${orderId}`);
    return res.data;
};

export const updateOrderStatus = async (tenantId, orderId, status) => {
    const res = await axiosClient.put(`/tenants/${tenantId}/orders/${orderId}/status`, { status });
    return res.data;
};

export const updateOrder = async (tenantId, orderId, data) => {
    const res = await axiosClient.put(`/tenants/${tenantId}/orders/${orderId}`, data);
    return res.data;
};

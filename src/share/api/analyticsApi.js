import { axiosClient } from './axiosClient';

export const getAnalyticsDashboard = async (tenantId, params = {}) => {
    const res = await axiosClient.get(`/tenants/${tenantId}/analytics/dashboard`, { params });
    return res.data;
};

export const getAnalyticsOverview = async (tenantId, params = {}) => {
    const res = await axiosClient.get(`/tenants/${tenantId}/analytics/overview`, { params });
    return res.data;
};

export const getAnalyticsTopProducts = async (tenantId, params = {}) => {
    const res = await axiosClient.get(`/tenants/${tenantId}/analytics/top-products`, { params });
    return res.data;
};

export const getAnalyticsRatings = async (tenantId, params = {}) => {
    const res = await axiosClient.get(`/tenants/${tenantId}/analytics/ratings`, { params });
    return res.data;
};

import { axiosClient } from './axiosClient';

// --- Themes ---
export const getThemes = async (tenantId) => {
    const res = await axiosClient.get(`/tenants/${tenantId}/themes`);
    return res.data;
};

export const getCurrentTheme = async (tenantId) => {
    const res = await axiosClient.get(`/tenants/${tenantId}/themes/current`);
    return res.data;
};

export const updateTheme = async (tenantId, data) => {
    const res = await axiosClient.put(`/tenants/${tenantId}/themes/current`, data);
    return res.data;
};

// --- Pages ---
export const getPages = async (tenantId) => {
    const res = await axiosClient.get(`/tenants/${tenantId}/pages`);
    return res.data;
};

export const getPageById = async (tenantId, pageId) => {
    const res = await axiosClient.get(`/tenants/${tenantId}/pages/${pageId}`);
    return res.data;
};

export const createPage = async (tenantId, data) => {
    const res = await axiosClient.post(`/tenants/${tenantId}/pages`, data);
    return res.data;
};

export const updatePage = async (tenantId, pageId, data) => {
    const res = await axiosClient.put(`/tenants/${tenantId}/pages/${pageId}`, data);
    return res.data;
};

export const deletePage = async (tenantId, pageId) => {
    const res = await axiosClient.delete(`/tenants/${tenantId}/pages/${pageId}`);
    return res.data;
};

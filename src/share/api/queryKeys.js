export const queryKeys = {
    tenants: {
        all: ['tenants'],
        me: () => [...queryKeys.tenants.all, 'me'],
        detail: (id) => [...queryKeys.tenants.all, id],
    },
    products: {
        all: (tenantId) => ['products', tenantId],
        list: (tenantId, params) => [...queryKeys.products.all(tenantId), 'list', params],
        detail: (tenantId, id) => [...queryKeys.products.all(tenantId), id],
        skus: (tenantId, productId) => [...queryKeys.products.all(tenantId), productId, 'skus'],
    },
    categories: {
        all: (tenantId) => ['categories', tenantId],
        list: (tenantId) => [...queryKeys.categories.all(tenantId), 'list'],
        detail: (tenantId, id) => [...queryKeys.categories.all(tenantId), id],
    },
    orders: {
        all: (tenantId) => ['orders', tenantId],
        list: (tenantId, params) => [...queryKeys.orders.all(tenantId), 'list', params],
        detail: (tenantId, id) => [...queryKeys.orders.all(tenantId), id],
    },
    themes: {
        all: (tenantId) => ['themes', tenantId],
        current: (tenantId) => [...queryKeys.themes.all(tenantId), 'current'],
    },
    pages: {
        all: (tenantId) => ['pages', tenantId],
        list: (tenantId) => [...queryKeys.pages.all(tenantId), 'list'],
        detail: (tenantId, id) => [...queryKeys.pages.all(tenantId), id],
    },
    customers: {
        all: (tenantId) => ['customers', tenantId],
        list: (tenantId, params) => [...queryKeys.customers.all(tenantId), 'list', params],
        detail: (tenantId, id) => [...queryKeys.customers.all(tenantId), id],
    },
    analytics: {
        all: (tenantId) => ['analytics', tenantId],
        dashboard: (tenantId, params) => [...queryKeys.analytics.all(tenantId), 'dashboard', params],
        overview: (tenantId, params) => [...queryKeys.analytics.all(tenantId), 'overview', params],
        topProducts: (tenantId, params) => [...queryKeys.analytics.all(tenantId), 'top-products', params],
        ratings: (tenantId, params) => [...queryKeys.analytics.all(tenantId), 'ratings', params],
    },
};

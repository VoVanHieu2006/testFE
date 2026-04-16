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
};

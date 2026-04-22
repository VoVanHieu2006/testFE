export const THEME_SETTINGS_STORAGE_KEY = 'admin.theme_settings';
export const PAGE_CONTENT_STORAGE_KEY = 'admin.page_contents';
export const DEFAULT_THEME_SETTINGS = {
    colors: {
        primary: '#111827',
        backgroundMain: '#f8fafc',
        textPrimary: '#0f172a',
    },
    typography: {
        fontFamily: 'Inter',
    },
    layout: {
        borderRadius: 12,
    },
    header: {
        backgroundColor: '#ffffff',
        textColor: '#111827',
    },
    footer: {
        backgroundColor: '#ffffff',
        textColor: '#111827',
    },
    productCard: {
        backgroundColor: '#ffffff',
        textColor: '#0f172a',
        style: 'shadow',
    },
};
export const DEFAULT_PAGE_CONTENT = {
    home: {
        heroImageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
        heroOverlayOpacity: 0.5,
        title: 'Modern Shopping for Modern Stores',
        subtitle: 'Experience high-end e-commerce with our minimal, SaaS-grade storefront solution. Curated for those who appreciate design.',
        featuredTitle: 'Featured Products',
        featuredSubtitle: 'The latest arrivals and community favorites.',
    },
    about: {
        story: 'We started as a small team helping merchants launch cleaner storefront experiences.\n\nToday we still focus on clarity, speed, and trust for every customer interaction.',
    },
};
function isBrowser() {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}
export function loadThemeSettings() {
    if (!isBrowser())
        return DEFAULT_THEME_SETTINGS;
    try {
        const raw = localStorage.getItem(THEME_SETTINGS_STORAGE_KEY);
        if (!raw)
            return DEFAULT_THEME_SETTINGS;
        const parsed = JSON.parse(raw);
        const style = parsed.productCard?.style;
        return {
            colors: { ...DEFAULT_THEME_SETTINGS.colors, ...parsed.colors },
            typography: { ...DEFAULT_THEME_SETTINGS.typography, ...parsed.typography },
            layout: { ...DEFAULT_THEME_SETTINGS.layout, ...parsed.layout },
            header: { ...DEFAULT_THEME_SETTINGS.header, ...parsed.header },
            footer: { ...DEFAULT_THEME_SETTINGS.footer, ...parsed.footer },
            productCard: {
                ...DEFAULT_THEME_SETTINGS.productCard,
                ...parsed.productCard,
                style: style === 'shadow' || style === 'border' || style === 'flat' ? style : DEFAULT_THEME_SETTINGS.productCard.style,
            },
        };
    }
    catch {
        return DEFAULT_THEME_SETTINGS;
    }
}
export function saveThemeSettings(value) {
    if (!isBrowser())
        return;
    localStorage.setItem(THEME_SETTINGS_STORAGE_KEY, JSON.stringify(value));
}
export function loadPageContent() {
    if (!isBrowser())
        return DEFAULT_PAGE_CONTENT;
    try {
        const raw = localStorage.getItem(PAGE_CONTENT_STORAGE_KEY);
        if (!raw)
            return DEFAULT_PAGE_CONTENT;
        const parsed = JSON.parse(raw);
        return {
            home: { ...DEFAULT_PAGE_CONTENT.home, ...parsed.home },
            about: { ...DEFAULT_PAGE_CONTENT.about, ...parsed.about },
        };
    }
    catch {
        return DEFAULT_PAGE_CONTENT;
    }
}
export function savePageContent(value) {
    if (!isBrowser())
        return;
    localStorage.setItem(PAGE_CONTENT_STORAGE_KEY, JSON.stringify(value));
}

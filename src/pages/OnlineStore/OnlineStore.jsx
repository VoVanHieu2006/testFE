import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react';
import LivePreview from '../../widgets/LivePreview/LivePreview';
import {
    DEFAULT_PAGE_CONTENT,
    DEFAULT_THEME_SETTINGS,
    loadPageContent,
    loadThemeSettings,
    saveThemeSettings,
    apiThemeToInternal,
    internalThemeToApi,
} from '../../share/config/storefrontSettings';
import { useUnsavedChangesGuard } from '../../share/lib/hooks/useUnsavedChangesGuard';
import { useAuth } from '../../entities/auth/AuthContext';
import { getTenantBySubdomain, patchTenantTheme } from '../../share/api/tenantApi';

const FONT_OPTIONS = ['Inter', 'Poppins', 'Montserrat', 'Merriweather', 'Lato'];

function AccordionSection({ title, isOpen, onToggle, children }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white">
            <button type="button" onClick={onToggle} className="flex w-full items-center justify-between px-4 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">{title}</span>
                {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
            </button>
            {isOpen && <div className="space-y-4 border-t border-slate-100 px-4 py-4">{children}</div>}
        </section>
    );
}

function ColorField({ label, value, onChange }) {
    return (
        <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-10 w-12 rounded border border-slate-300 bg-white p-1"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-10 flex-1 rounded border border-slate-300 px-3 text-sm uppercase outline-none focus:border-slate-600"
                />
            </div>
        </label>
    );
}

export default function OnlineStore() {
    const { currentTenant } = useAuth();
    const subdomain = currentTenant?.subdomain;
    const storeData = {
        storeName: currentTenant?.storeName || currentTenant?.subdomain || 'FLUXIFY',
        logoUrl: '',
    };

    const [theme, setTheme] = useState(() => loadThemeSettings());
    const [savedTheme, setSavedTheme] = useState(() => loadThemeSettings());
    const [pageData, setPageData] = useState(() => loadPageContent());
    const [validationMessage, setValidationMessage] = useState(null);
    const [openAccordion, setOpenAccordion] = useState('colors');
    const [currentView, setCurrentView] = useState('home');
    const [isLoadingTheme, setIsLoadingTheme] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState(null);

    const isDirty = useMemo(() => JSON.stringify(theme) !== JSON.stringify(savedTheme), [theme, savedTheme]);

    // Load theme from API
    useEffect(() => {
        if (!subdomain) return;
        setIsLoadingTheme(true);
        setApiError(null);
        getTenantBySubdomain(subdomain)
            .then((data) => {
                if (data.themeConfig) {
                    const internal = apiThemeToInternal(data.themeConfig);
                    setTheme(internal);
                    setSavedTheme(internal);
                    saveThemeSettings(internal);
                }
            })
            .catch(() => {
                // fall back to localStorage / defaults — no error shown on load
            })
            .finally(() => setIsLoadingTheme(false));
    }, [subdomain]);

    // Sync pageData from localStorage (managed by PageManager)
    useEffect(() => {
        setPageData(loadPageContent());
        const onStorage = (event) => {
            if (event.key === 'admin.page_contents') {
                setPageData(loadPageContent());
            }
            if (event.key === 'admin.theme_settings') {
                const latestTheme = loadThemeSettings();
                setTheme(latestTheme);
                setSavedTheme(latestTheme);
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    useUnsavedChangesGuard(isDirty);

    const isHexColor = (value) => /^#([0-9a-fA-F]{6})$/.test((value || '').trim());

    const validateTheme = (data) => {
        const colorValues = [
            data.colors.primary,
            data.colors.backgroundMain,
            data.colors.textPrimary,
            data.header.backgroundColor,
            data.header.textColor,
            data.footer.backgroundColor,
            data.footer.textColor,
            data.productCard.backgroundColor,
            data.productCard.textColor,
            data.productCard.price,
            data.productCard.badge,
        ];
        if (colorValues.some((color) => !isHexColor(color))) {
            return 'Color format không hợp lệ. Hãy dùng định dạng #RRGGBB.';
        }
        if (!data.typography.fontFamily.trim()) {
            return 'Font Family không được để trống.';
        }
        if (data.layout.borderRadius < 0 || data.layout.borderRadius > 40) {
            return 'Border Radius phải nằm trong khoảng 0 đến 40.';
        }
        return null;
    };

    const handleSaveChanges = async () => {
        const error = validateTheme(theme);
        if (error) {
            setValidationMessage(error);
            return;
        }
        if (!subdomain) {
            setValidationMessage('Chưa chọn cửa hàng.');
            return;
        }
        try {
            setIsSaving(true);
            setApiError(null);
            setValidationMessage(null);
            const apiPayload = internalThemeToApi(theme);
            await patchTenantTheme(subdomain, apiPayload);
            setSavedTheme(theme);
            saveThemeSettings(theme);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data || 'Lưu theme thất bại. Vui lòng thử lại.';
            setApiError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePreviewPage = (nextPage) => {
        if (nextPage === currentView) return;
        if (isDirty) {
            setValidationMessage('Bạn cần Save changes trước khi chuyển trang preview.');
            return;
        }
        setValidationMessage(null);
        setCurrentView(nextPage);
    };

    const previewPageButtons = useMemo(() => [
        { value: 'home', label: 'Home' },
        { value: 'products', label: 'Products' },
        { value: 'about', label: 'About Us' },
        { value: 'contact', label: 'Contact' },
    ], []);

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full bg-slate-100">
            <aside className="w-[360px] shrink-0 border-r border-slate-200 bg-slate-50 p-4 overflow-y-auto">
                <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Theme Editor</p>
                    <p className="mt-1 text-sm text-slate-700">
                        {subdomain ? (
                            <>Store: <span className="font-semibold">{subdomain}</span></>
                        ) : (
                            'Design tokens only. Select a store to save.'
                        )}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSaveChanges}
                            disabled={!isDirty || isSaving || isLoadingTheme}
                            className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                            Save changes
                        </button>
                        {isDirty
                            ? <span className="text-xs font-medium text-amber-600">Unsaved changes</span>
                            : <span className="text-xs font-medium text-emerald-600">Saved</span>
                        }
                        {isLoadingTheme && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
                    </div>
                    {validationMessage && (
                        <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {validationMessage}
                        </p>
                    )}
                    {apiError && (
                        <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {apiError}
                        </p>
                    )}
                </div>

                <AccordionSection title="🎨 Colors" isOpen={openAccordion === 'colors'} onToggle={() => setOpenAccordion(openAccordion === 'colors' ? 'typography' : 'colors')}>
                    <ColorField label="Primary" value={theme.colors.primary} onChange={(v) => setTheme((p) => ({ ...p, colors: { ...p.colors, primary: v } }))} />
                    <ColorField label="Background Main" value={theme.colors.backgroundMain} onChange={(v) => setTheme((p) => ({ ...p, colors: { ...p.colors, backgroundMain: v } }))} />
                    <ColorField label="Text Primary" value={theme.colors.textPrimary} onChange={(v) => setTheme((p) => ({ ...p, colors: { ...p.colors, textPrimary: v } }))} />
                </AccordionSection>

                <div className="mt-3">
                    <AccordionSection title="🔠 Typography & Layout" isOpen={openAccordion === 'typography'} onToggle={() => setOpenAccordion(openAccordion === 'typography' ? 'headerFooter' : 'typography')}>
                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-700">Font Family</span>
                            <select
                                value={theme.typography.fontFamily}
                                onChange={(e) => setTheme((p) => ({ ...p, typography: { ...p.typography, fontFamily: e.target.value } }))}
                                className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-600"
                            >
                                {FONT_OPTIONS.map((font) => <option key={font} value={font}>{font}</option>)}
                            </select>
                        </label>
                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-700">Border Radius (px)</span>
                            <input
                                type="number"
                                min={0}
                                max={40}
                                value={theme.layout.borderRadius}
                                onChange={(e) => setTheme((p) => ({ ...p, layout: { ...p.layout, borderRadius: Number(e.target.value) || 0 } }))}
                                className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-600"
                            />
                        </label>
                    </AccordionSection>
                </div>

                <div className="mt-3">
                    <AccordionSection title="🧩 Header & Footer" isOpen={openAccordion === 'headerFooter'} onToggle={() => setOpenAccordion(openAccordion === 'headerFooter' ? 'productCard' : 'headerFooter')}>
                        <ColorField label="Header Background" value={theme.header.backgroundColor} onChange={(v) => setTheme((p) => ({ ...p, header: { ...p.header, backgroundColor: v } }))} />
                        <ColorField label="Header Text" value={theme.header.textColor} onChange={(v) => setTheme((p) => ({ ...p, header: { ...p.header, textColor: v } }))} />
                        <ColorField label="Footer Background" value={theme.footer.backgroundColor} onChange={(v) => setTheme((p) => ({ ...p, footer: { ...p.footer, backgroundColor: v } }))} />
                        <ColorField label="Footer Text" value={theme.footer.textColor} onChange={(v) => setTheme((p) => ({ ...p, footer: { ...p.footer, textColor: v } }))} />
                    </AccordionSection>
                </div>

                <div className="mt-3">
                    <AccordionSection title="🛍️ Product Card" isOpen={openAccordion === 'productCard'} onToggle={() => setOpenAccordion(openAccordion === 'productCard' ? 'colors' : 'productCard')}>
                        <ColorField label="Background" value={theme.productCard.backgroundColor} onChange={(v) => setTheme((p) => ({ ...p, productCard: { ...p.productCard, backgroundColor: v } }))} />
                        <ColorField label="Text Color" value={theme.productCard.textColor} onChange={(v) => setTheme((p) => ({ ...p, productCard: { ...p.productCard, textColor: v } }))} />
                        <ColorField label="Price Color" value={theme.productCard.price} onChange={(v) => setTheme((p) => ({ ...p, productCard: { ...p.productCard, price: v } }))} />
                        <ColorField label="Badge Color" value={theme.productCard.badge} onChange={(v) => setTheme((p) => ({ ...p, productCard: { ...p.productCard, badge: v } }))} />
                    </AccordionSection>
                </div>
            </aside>

            <section className="flex-1 min-w-0 flex flex-col">
                <div className="border-b border-slate-200 bg-white px-5 py-3">
                    <div className="inline-flex rounded-lg bg-slate-100 p-1">
                        {previewPageButtons.map((page) => (
                            <button
                                key={page.value}
                                type="button"
                                onClick={() => handleChangePreviewPage(page.value)}
                                className={`rounded-md px-3 py-1.5 text-sm transition ${currentView === page.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
                            >
                                {page.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 min-h-0">
                    <LivePreview
                        themeData={theme}
                        pageData={pageData ?? DEFAULT_PAGE_CONTENT}
                        activePage={currentView}
                        storeData={storeData}
                    />
                </div>
            </section>
        </div>
    );
}

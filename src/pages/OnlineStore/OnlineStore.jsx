import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react';
import LivePreview from '../../widgets/LivePreview/LivePreview';
import {
    DEFAULT_PAGE_CONTENT,
    loadPageContent,
    loadThemeSettings,
    saveThemeSettings,
    savePageContent,
    apiThemeToInternal,
    internalThemeToApi,
    apiContentToInternal,
} from '../../share/config/storefrontSettings';
import { useUnsavedChangesGuard } from '../../share/lib/hooks/useUnsavedChangesGuard';
import { useAuth } from '../../entities/auth/AuthContext';
import { getTenantBySubdomain, patchTenantTheme, patchTenantContent } from '../../share/api/tenantApi';


function AccordionSection({ title, isOpen, onToggle, children }) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white">
            <button type="button" onClick={onToggle} className="flex min-h-11 w-full items-center justify-between px-4 py-3 text-left">
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
                    className="h-11 w-12 rounded border border-slate-300 bg-white p-1"
                />
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="h-11 min-w-0 flex-1 rounded border border-slate-300 px-3 text-sm uppercase outline-none focus:border-slate-600"
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

    // --- Theme state ---
    const [theme, setTheme] = useState(() => loadThemeSettings());
    const [savedTheme, setSavedTheme] = useState(() => loadThemeSettings());

    // --- Page content state ---
    const [pageData, setPageData] = useState(() => loadPageContent());
    const [savedPageData, setSavedPageData] = useState(() => loadPageContent());

    const [validationMessage, setValidationMessage] = useState(null);
    const [openAccordion, setOpenAccordion] = useState('colors');
    const [currentView, setCurrentView] = useState('home');
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [apiError, setApiError] = useState(null);

    const isDirty = useMemo(
        () =>
            JSON.stringify(theme) !== JSON.stringify(savedTheme) ||
            JSON.stringify(pageData) !== JSON.stringify(savedPageData),
        [theme, savedTheme, pageData, savedPageData]
    );

    // Load both theme and content from API on mount / tenant change
    useEffect(() => {
        if (!subdomain) return;
        setIsLoadingData(true);
        setApiError(null);
        getTenantBySubdomain(subdomain)
            .then((data) => {
                if (data.themeConfig) {
                    const internal = apiThemeToInternal(data.themeConfig);
                    setTheme(internal);
                    setSavedTheme(internal);
                    saveThemeSettings(internal);
                }
                if (data.contentConfig) {
                    const internal = apiContentToInternal(data.contentConfig);
                    setPageData(internal);
                    setSavedPageData(internal);
                    savePageContent(internal);
                }
            })
            .catch(() => {
                // fall back to localStorage / defaults
            })
            .finally(() => setIsLoadingData(false));
    }, [subdomain]);

    useUnsavedChangesGuard(isDirty);

    const isHexColor = (value) => /^#([0-9a-fA-F]{6})$/.test((value || '').trim());

    const isUrl = (value) => {
        try {
            const parsed = new URL(value);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const validate = () => {
        const colorValues = [
            theme.colors.primary,
            theme.colors.backgroundMain,
            theme.colors.textPrimary,
            theme.header.backgroundColor,
            theme.header.textColor,
            theme.footer.backgroundColor,
            theme.footer.textColor,
            theme.productCard.backgroundColor,
            theme.productCard.textColor,
            theme.productCard.price,
            theme.productCard.badge,
        ];
        if (colorValues.some((c) => !isHexColor(c))) {
            return 'Color format không hợp lệ. Hãy dùng định dạng #RRGGBB.';
        }
        if (!theme.typography.fontFamily.trim()) {
            return 'Font Family không được để trống.';
        }
        if (theme.layout.borderRadius < 0 || theme.layout.borderRadius > 40) {
            return 'Border Radius phải nằm trong khoảng 0 đến 40.';
        }
        if (pageData.home.heroImageUrl && !isUrl(pageData.home.heroImageUrl.trim())) {
            return 'Hero Image URL không hợp lệ. Hãy dùng http(s) URL.';
        }
        if (pageData.home.heroOverlayOpacity < 0 || pageData.home.heroOverlayOpacity > 1) {
            return 'Hero Overlay Opacity phải nằm trong khoảng 0 đến 1.';
        }
        return null;
    };

    const handleSaveChanges = async () => {
        const error = validate();
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

            await Promise.all([
                patchTenantTheme(subdomain, internalThemeToApi(theme)),
                patchTenantContent(subdomain, {
                    home: {
                        heroImageUrl: pageData.home.heroImageUrl || null,
                        heroOverlayOpacity: pageData.home.heroOverlayOpacity,
                        title: pageData.home.title || null,
                        subtitle: pageData.home.subtitle || null,
                        featuredTitle: pageData.home.featuredTitle || null,
                        featuredSubtitle: pageData.home.featuredSubtitle || null,
                    },
                    about: {
                        story: pageData.about.story || null,
                    },
                }),
            ]);

            setSavedTheme(theme);
            setSavedPageData(pageData);
            saveThemeSettings(theme);
            savePageContent(pageData);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data || 'Lưu thất bại. Vui lòng thử lại.';
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
        <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col bg-slate-100 xl:h-[calc(100vh-4rem)] xl:flex-row">
            <aside className="max-h-none w-full shrink-0 border-b border-slate-200 bg-slate-50 p-4 xl:h-full xl:w-[360px] xl:overflow-y-auto xl:border-b-0 xl:border-r">
                {/* Header card */}
                <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Theme & Content Editor</p>
                    <p className="mt-1 text-sm text-slate-700">
                        {subdomain ? (
                            <>Store: <span className="font-semibold">{subdomain}</span></>
                        ) : (
                            'Select a store to load and save settings.'
                        )}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSaveChanges}
                            disabled={!isDirty || isSaving || isLoadingData}
                            className="flex min-h-10 items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
                            Save changes
                        </button>
                        {isDirty
                            ? <span className="text-xs font-medium text-amber-600">Unsaved changes</span>
                            : <span className="text-xs font-medium text-emerald-600">Saved</span>
                        }
                        {isLoadingData && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
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

                {/* ── THEME SECTIONS ── */}
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
                                className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-600"
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
                                className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-600"
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
                    <AccordionSection title="🛍️ Product Card" isOpen={openAccordion === 'productCard'} onToggle={() => setOpenAccordion(openAccordion === 'productCard' ? 'heroBanner' : 'productCard')}>
                        <ColorField label="Background" value={theme.productCard.backgroundColor} onChange={(v) => setTheme((p) => ({ ...p, productCard: { ...p.productCard, backgroundColor: v } }))} />
                        <ColorField label="Text Color" value={theme.productCard.textColor} onChange={(v) => setTheme((p) => ({ ...p, productCard: { ...p.productCard, textColor: v } }))} />
                        <ColorField label="Price Color" value={theme.productCard.price} onChange={(v) => setTheme((p) => ({ ...p, productCard: { ...p.productCard, price: v } }))} />
                        <ColorField label="Badge Color" value={theme.productCard.badge} onChange={(v) => setTheme((p) => ({ ...p, productCard: { ...p.productCard, badge: v } }))} />
                    </AccordionSection>
                </div>

                {/* ── CONTENT SECTIONS ── */}
                <div className="mt-4 pb-1 px-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Page Content</span>
                </div>

                <div className="mt-2">
                    <AccordionSection title="🖼️ Hero Banner" isOpen={openAccordion === 'heroBanner'} onToggle={() => setOpenAccordion(openAccordion === 'heroBanner' ? 'featuredSection' : 'heroBanner')}>
                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-700">Image URL</span>
                            <input
                                type="url"
                                value={pageData.home.heroImageUrl}
                                onChange={(e) => setPageData((p) => ({ ...p, home: { ...p.home, heroImageUrl: e.target.value } }))}
                                className="h-11 w-full rounded border border-slate-300 px-3 text-sm outline-none focus:border-slate-600"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-700">Title</span>
                            <input
                                type="text"
                                value={pageData.home.title}
                                onChange={(e) => setPageData((p) => ({ ...p, home: { ...p.home, title: e.target.value } }))}
                                className="h-11 w-full rounded border border-slate-300 px-3 text-sm outline-none focus:border-slate-600"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-700">Subtitle</span>
                            <textarea
                                value={pageData.home.subtitle}
                                onChange={(e) => setPageData((p) => ({ ...p, home: { ...p.home, subtitle: e.target.value } }))}
                                rows={3}
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-600"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-700">
                                Overlay Opacity: {pageData.home.heroOverlayOpacity.toFixed(1)}
                            </span>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.1}
                                value={pageData.home.heroOverlayOpacity}
                                onChange={(e) => setPageData((p) => ({ ...p, home: { ...p.home, heroOverlayOpacity: Number(e.target.value) } }))}
                                className="w-full accent-slate-900"
                            />
                        </label>
                    </AccordionSection>
                </div>

                <div className="mt-3">
                    <AccordionSection title="⭐ Featured Section" isOpen={openAccordion === 'featuredSection'} onToggle={() => setOpenAccordion(openAccordion === 'featuredSection' ? 'aboutStory' : 'featuredSection')}>
                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-700">Title</span>
                            <input
                                type="text"
                                value={pageData.home.featuredTitle}
                                onChange={(e) => setPageData((p) => ({ ...p, home: { ...p.home, featuredTitle: e.target.value } }))}
                                className="h-11 w-full rounded border border-slate-300 px-3 text-sm outline-none focus:border-slate-600"
                            />
                        </label>
                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-700">Subtitle</span>
                            <textarea
                                value={pageData.home.featuredSubtitle}
                                onChange={(e) => setPageData((p) => ({ ...p, home: { ...p.home, featuredSubtitle: e.target.value } }))}
                                rows={3}
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-600"
                            />
                        </label>
                    </AccordionSection>
                </div>

                <div className="mt-3">
                    <AccordionSection title="📖 About Story" isOpen={openAccordion === 'aboutStory'} onToggle={() => setOpenAccordion(openAccordion === 'aboutStory' ? 'colors' : 'aboutStory')}>
                        <label className="block space-y-2">
                            <span className="text-sm font-medium text-slate-700">Paragraphs</span>
                            <textarea
                                value={pageData.about.story}
                                onChange={(e) => setPageData((p) => ({ ...p, about: { ...p.about, story: e.target.value } }))}
                                rows={8}
                                className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-600"
                            />
                        </label>
                    </AccordionSection>
                </div>
            </aside>

            <section className="flex min-h-[560px] min-w-0 flex-1 flex-col xl:min-h-0">
                <div className="border-b border-slate-200 bg-white px-3 py-3 sm:px-5">
                    <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">
                        {previewPageButtons.map((page) => (
                            <button
                                key={page.value}
                                type="button"
                                onClick={() => handleChangePreviewPage(page.value)}
                                className={`min-h-9 shrink-0 rounded-md px-3 py-1.5 text-sm transition ${currentView === page.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
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

const FONT_OPTIONS = ['Inter', 'Poppins', 'Montserrat', 'Merriweather', 'Lato'];

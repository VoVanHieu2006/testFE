import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Palette, Loader2, AlertCircle, Save, RotateCcw } from 'lucide-react';
import { useAuth } from '../../entities/auth/AuthContext';
import { getCurrentTheme, updateTheme } from '../../share/api/storeApi';
import { queryKeys } from '../../share/api/queryKeys';

const DEFAULT_THEME = {
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    accentColor: '#3b82f6',
    fontFamily: 'Inter',
    borderRadius: 'medium',
    headerBg: '#ffffff',
    footerBg: '#f8f8f8',
    heroTitle: '',
    heroSubtitle: '',
    heroButtonText: 'Shop Now',
    logoUrl: '',
    bannerUrl: '',
};

const FONT_OPTIONS = ['Inter', 'Roboto', 'Poppins', 'Playfair Display', 'Montserrat', 'Open Sans'];
const RADIUS_OPTIONS = [
    { value: 'none', label: 'None (0px)' },
    { value: 'small', label: 'Small (4px)' },
    { value: 'medium', label: 'Medium (8px)' },
    { value: 'large', label: 'Large (16px)' },
    { value: 'full', label: 'Full (rounded)' },
];

function ColorField({ label, name, value, onChange }) {
    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="w-9 h-9 rounded cursor-pointer border border-[#e3e3e3] p-0.5"
                />
                <input
                    type="text"
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="flex-1 px-3 py-2 rounded-lg border border-[#e3e3e3] focus:border-black text-sm outline-none font-mono"
                />
            </div>
        </div>
    );
}

function ThemePreview({ theme }) {
    const radiusMap = { none: '0px', small: '4px', medium: '8px', large: '16px', full: '9999px' };
    const radius = radiusMap[theme.borderRadius] || '8px';

    return (
        <div className="border border-[#e3e3e3] rounded-xl overflow-hidden text-xs" style={{ fontFamily: theme.fontFamily }}>
            {/* Header */}
            <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: theme.headerBg }}>
                {theme.logoUrl ? (
                    <img src={theme.logoUrl} alt="logo" className="h-6 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                    <span className="font-bold text-sm" style={{ color: theme.primaryColor }}>Your Store</span>
                )}
                <div className="flex gap-2">
                    {['Home', 'Products', 'About'].map(t => (
                        <span key={t} className="text-slate-500">{t}</span>
                    ))}
                </div>
            </div>

            {/* Hero */}
            <div className="p-6 text-center" style={{ backgroundColor: theme.accentColor + '15' }}>
                {theme.bannerUrl && (
                    <img src={theme.bannerUrl} alt="banner" className="w-full h-20 object-cover rounded mb-3" onError={(e) => { e.target.style.display = 'none'; }} />
                )}
                <h2 className="font-bold text-sm mb-1" style={{ color: theme.primaryColor }}>
                    {theme.heroTitle || 'Welcome to Your Store'}
                </h2>
                <p className="text-slate-500 mb-3">{theme.heroSubtitle || 'Discover our amazing products'}</p>
                <button
                    className="px-4 py-1.5 text-xs font-medium"
                    style={{
                        backgroundColor: theme.primaryColor,
                        color: theme.secondaryColor,
                        borderRadius: radius,
                    }}
                >
                    {theme.heroButtonText || 'Shop Now'}
                </button>
            </div>

            {/* Products grid preview */}
            <div className="p-3 grid grid-cols-3 gap-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className="border border-[#e3e3e3]" style={{ borderRadius: radius }}>
                        <div className="h-12 bg-slate-100" />
                        <div className="p-1.5">
                            <div className="h-2 bg-slate-200 rounded mb-1 w-3/4" />
                            <div className="h-2 bg-slate-100 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 text-center text-slate-400" style={{ backgroundColor: theme.footerBg }}>
                © 2025 Your Store
            </div>
        </div>
    );
}

export default function ThemeEditor() {
    const { currentTenant } = useAuth();
    const tenantId = currentTenant?.tenantId;
    const queryClient = useQueryClient();

    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [serverError, setServerError] = useState('');

    const { data: themeData, isLoading, isError } = useQuery({
        queryKey: queryKeys.themes.current(tenantId),
        queryFn: () => getCurrentTheme(tenantId),
        enabled: !!tenantId,
    });

    const [form, setForm] = useState(null);

    const currentForm = form ?? (themeData ? { ...DEFAULT_THEME, ...themeData } : DEFAULT_THEME);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...(prev ?? currentForm), [name]: value }));
        setServerError('');
        setSaveSuccess(false);
    };

    const handleReset = () => {
        setForm(themeData ? { ...DEFAULT_THEME, ...themeData } : DEFAULT_THEME);
        setSaveSuccess(false);
        setServerError('');
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setServerError('');
            await updateTheme(tenantId, currentForm);
            queryClient.invalidateQueries({ queryKey: queryKeys.themes.current(tenantId) });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data || 'Failed to save theme.';
            setServerError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setIsSaving(false);
        }
    };

    if (!tenantId) {
        return (
            <div className="p-8 flex items-center gap-3 text-slate-500">
                <AlertCircle className="w-5 h-5" />
                <span>Please select a store to edit its theme.</span>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Theme Editor</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Customize the look and feel of your storefront</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#e3e3e3] text-sm font-medium text-slate-700 hover:bg-[#f8f8f8] transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-60"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : 'Save Theme'}
                    </button>
                </div>
            </div>

            {saveSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg">
                    Theme saved successfully!
                </div>
            )}
            {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">{serverError}</div>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    <span className="ml-2 text-slate-500 text-sm">Loading theme...</span>
                </div>
            ) : isError ? (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm px-4 py-2 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Could not load saved theme. Using default settings. You can still customize and save.</span>
                </div>
            ) : null}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Controls */}
                <div className="space-y-6">
                    {/* Colors */}
                    <div className="bg-white rounded-xl border border-[#e3e3e3] p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Palette className="w-4 h-4 text-slate-500" />
                            <h2 className="text-sm font-semibold text-slate-800">Colors</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <ColorField label="Primary Color" name="primaryColor" value={currentForm.primaryColor} onChange={handleChange} />
                            <ColorField label="Secondary Color" name="secondaryColor" value={currentForm.secondaryColor} onChange={handleChange} />
                            <ColorField label="Accent Color" name="accentColor" value={currentForm.accentColor} onChange={handleChange} />
                            <ColorField label="Header Background" name="headerBg" value={currentForm.headerBg} onChange={handleChange} />
                            <ColorField label="Footer Background" name="footerBg" value={currentForm.footerBg} onChange={handleChange} />
                        </div>
                    </div>

                    {/* Typography & Shape */}
                    <div className="bg-white rounded-xl border border-[#e3e3e3] p-5">
                        <h2 className="text-sm font-semibold text-slate-800 mb-4">Typography & Shape</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Font Family</label>
                                <select name="fontFamily" value={currentForm.fontFamily} onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg border border-[#e3e3e3] focus:border-black text-sm bg-white outline-none">
                                    {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Border Radius</label>
                                <select name="borderRadius" value={currentForm.borderRadius} onChange={handleChange}
                                    className="w-full px-3 py-2 rounded-lg border border-[#e3e3e3] focus:border-black text-sm bg-white outline-none">
                                    {RADIUS_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Branding */}
                    <div className="bg-white rounded-xl border border-[#e3e3e3] p-5">
                        <h2 className="text-sm font-semibold text-slate-800 mb-4">Branding & Hero</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
                                <input name="logoUrl" value={currentForm.logoUrl} onChange={handleChange} placeholder="https://..."
                                    className="w-full px-3 py-2 rounded-lg border border-[#e3e3e3] focus:border-black text-sm outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Banner / Hero Image URL</label>
                                <input name="bannerUrl" value={currentForm.bannerUrl} onChange={handleChange} placeholder="https://..."
                                    className="w-full px-3 py-2 rounded-lg border border-[#e3e3e3] focus:border-black text-sm outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Hero Title</label>
                                <input name="heroTitle" value={currentForm.heroTitle} onChange={handleChange} placeholder="Welcome to Our Store"
                                    className="w-full px-3 py-2 rounded-lg border border-[#e3e3e3] focus:border-black text-sm outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Hero Subtitle</label>
                                <input name="heroSubtitle" value={currentForm.heroSubtitle} onChange={handleChange} placeholder="Discover amazing products"
                                    className="w-full px-3 py-2 rounded-lg border border-[#e3e3e3] focus:border-black text-sm outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Hero Button Text</label>
                                <input name="heroButtonText" value={currentForm.heroButtonText} onChange={handleChange} placeholder="Shop Now"
                                    className="w-full px-3 py-2 rounded-lg border border-[#e3e3e3] focus:border-black text-sm outline-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-[#e3e3e3] p-5">
                        <h2 className="text-sm font-semibold text-slate-800 mb-4">Live Preview</h2>
                        <ThemePreview theme={currentForm} />
                    </div>
                </div>
            </div>
        </div>
    );
}

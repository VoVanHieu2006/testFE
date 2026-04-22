import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import LivePreview from '../../widgets/LivePreview/ui/LivePreview';
import { DEFAULT_PAGE_CONTENT, loadPageContent, loadThemeSettings, saveThemeSettings, } from '../../shared/config/storefrontSettings';
import { useStoreData } from '../../shared/lib/hooks/useStoreData';
import { useUnsavedChangesGuard } from '../../shared/lib/hooks/useUnsavedChangesGuard';
const FONT_OPTIONS = ['Inter', 'Poppins', 'Montserrat', 'Merriweather', 'Lato'];
const DEFAULT_STORE_DATA = {
    storeName: 'FLUXIFY',
    logoUrl: '',
};
function AccordionSection({ title, isOpen, onToggle, children, }) {
    return (<section className="rounded-xl border border-slate-200 bg-white">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">{title}</span>
        {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500"/> : <ChevronDown className="h-4 w-4 text-slate-500"/>}
      </button>
      {isOpen && <div className="space-y-4 border-t border-slate-100 px-4 py-4">{children}</div>}
    </section>);
}
function ColorField({ label, value, onChange, }) {
    return (<label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 w-12 rounded border border-slate-300 bg-white p-1"/>
        <input type="text" value={value} onChange={(event) => onChange(event.target.value)} className="h-10 flex-1 rounded border border-slate-300 px-3 text-sm uppercase outline-none focus:border-slate-600"/>
      </div>
    </label>);
}
export default function OnlineStore() {
  const storeData = useStoreData(DEFAULT_STORE_DATA);
    const [theme, setTheme] = useState(() => loadThemeSettings());
    const [savedTheme, setSavedTheme] = useState(() => loadThemeSettings());
    const [pageData, setPageData] = useState(() => loadPageContent());
    const [validationMessage, setValidationMessage] = useState(null);
    const [openAccordion, setOpenAccordion] = useState('colors');
    const [currentView, setCurrentView] = useState('home');
    const isDirty = useMemo(() => JSON.stringify(theme) !== JSON.stringify(savedTheme), [theme, savedTheme]);
    useEffect(() => {
        setTheme(loadThemeSettings());
        setSavedTheme(loadThemeSettings());
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
    const isHexColor = (value) => /^#([0-9a-fA-F]{6})$/.test(value.trim());
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
        ];
        if (colorValues.some((color) => !isHexColor(color))) {
            return 'Color format khong hop le. Hay dung dinh dang #RRGGBB.';
        }
        if (!data.typography.fontFamily.trim()) {
            return 'Font Family khong duoc de trong.';
        }
        if (data.layout.borderRadius < 0 || data.layout.borderRadius > 40) {
            return 'Border Radius phai nam trong khoang 0 den 40.';
        }
        if (!['shadow', 'border', 'flat'].includes(data.productCard.style)) {
            return 'Product Card style khong hop le.';
        }
        return null;
    };
    const handleSaveChanges = () => {
        const error = validateTheme(theme);
        if (error) {
            setValidationMessage(error);
            return;
        }
        setSavedTheme(theme);
        saveThemeSettings(theme);
        setValidationMessage(null);
    };
    const handleChangePreviewPage = (nextPage) => {
        if (nextPage === currentView)
            return;
        if (isDirty) {
            setValidationMessage('Ban can Save changes truoc khi chuyen trang preview.');
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
    return (<div className="flex h-[calc(100vh-4rem)] w-full bg-slate-100">
      <aside className="w-[360px] shrink-0 border-r border-slate-200 bg-slate-50 p-4 overflow-y-auto">
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Theme Editor</p>
          <p className="mt-1 text-sm text-slate-700">Design tokens only. Content is managed in Pages Manager.</p>
          <div className="mt-3 flex items-center gap-2">
            <button type="button" onClick={handleSaveChanges} className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={!isDirty}>
              Save changes
            </button>
            {isDirty ? (<span className="text-xs font-medium text-amber-600">Unsaved changes</span>) : (<span className="text-xs font-medium text-emerald-600">Saved</span>)}
          </div>
          {validationMessage && <p className="mt-2 text-xs font-medium text-red-600">{validationMessage}</p>}
        </div>

        <AccordionSection title="🎨 Colors" isOpen={openAccordion === 'colors'} onToggle={() => setOpenAccordion(openAccordion === 'colors' ? 'typography' : 'colors')}>
          <ColorField label="Primary" value={theme.colors.primary} onChange={(next) => setTheme((prev) => ({ ...prev, colors: { ...prev.colors, primary: next } }))}/>
          <ColorField label="Background Main" value={theme.colors.backgroundMain} onChange={(next) => setTheme((prev) => ({ ...prev, colors: { ...prev.colors, backgroundMain: next } }))}/>
          <ColorField label="Text Primary" value={theme.colors.textPrimary} onChange={(next) => setTheme((prev) => ({ ...prev, colors: { ...prev.colors, textPrimary: next } }))}/>
        </AccordionSection>

        <div className="mt-3">
          <AccordionSection title="🔠 Typography & Layout" isOpen={openAccordion === 'typography'} onToggle={() => setOpenAccordion(openAccordion === 'typography' ? 'headerFooter' : 'typography')}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Font Family</span>
              <select value={theme.typography.fontFamily} onChange={(event) => setTheme((prev) => ({
            ...prev,
            typography: { ...prev.typography, fontFamily: event.target.value },
        }))} className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-600">
                {FONT_OPTIONS.map((font) => (<option key={font} value={font}>
                    {font}
                  </option>))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Border Radius (px)</span>
              <input type="number" min={0} max={40} value={theme.layout.borderRadius} onChange={(event) => setTheme((prev) => ({
            ...prev,
            layout: { ...prev.layout, borderRadius: Number(event.target.value) || 0 },
        }))} className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-600"/>
            </label>
          </AccordionSection>
        </div>

        <div className="mt-3">
          <AccordionSection title="🧩 Header & Footer" isOpen={openAccordion === 'headerFooter'} onToggle={() => setOpenAccordion(openAccordion === 'headerFooter' ? 'productCard' : 'headerFooter')}>
            <ColorField label="Header Background" value={theme.header.backgroundColor} onChange={(next) => setTheme((prev) => ({ ...prev, header: { ...prev.header, backgroundColor: next } }))}/>
            <ColorField label="Header Text" value={theme.header.textColor} onChange={(next) => setTheme((prev) => ({ ...prev, header: { ...prev.header, textColor: next } }))}/>
            <ColorField label="Footer Background" value={theme.footer.backgroundColor} onChange={(next) => setTheme((prev) => ({ ...prev, footer: { ...prev.footer, backgroundColor: next } }))}/>
            <ColorField label="Footer Text" value={theme.footer.textColor} onChange={(next) => setTheme((prev) => ({ ...prev, footer: { ...prev.footer, textColor: next } }))}/>
          </AccordionSection>
        </div>

        <div className="mt-3">
          <AccordionSection title="🛍️ Product Card" isOpen={openAccordion === 'productCard'} onToggle={() => setOpenAccordion('productCard')}>
            <ColorField label="Background" value={theme.productCard.backgroundColor} onChange={(next) => setTheme((prev) => ({ ...prev, productCard: { ...prev.productCard, backgroundColor: next } }))}/>
            <ColorField label="Text Color" value={theme.productCard.textColor} onChange={(next) => setTheme((prev) => ({ ...prev, productCard: { ...prev.productCard, textColor: next } }))}/>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Style</span>
              <select value={theme.productCard.style} onChange={(event) => setTheme((prev) => ({
            ...prev,
            productCard: {
                ...prev.productCard,
                style: event.target.value,
            },
        }))} className="h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-600">
                <option value="shadow">shadow</option>
                <option value="border">border</option>
                <option value="flat">flat</option>
              </select>
            </label>
          </AccordionSection>
        </div>
      </aside>

      <section className="flex-1 min-w-0 flex flex-col">
        <div className="border-b border-slate-200 bg-white px-5 py-3">
          <div className="inline-flex rounded-lg bg-slate-100 p-1">
            {previewPageButtons.map((page) => (<button key={page.value} type="button" onClick={() => handleChangePreviewPage(page.value)} className={`rounded-md px-3 py-1.5 text-sm transition ${currentView === page.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>
                {page.label}
              </button>))}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <LivePreview themeData={theme} pageData={pageData ?? DEFAULT_PAGE_CONTENT} activePage={currentView} storeData={storeData}/>
        </div>
      </section>
    </div>);
}

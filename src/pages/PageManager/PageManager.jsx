import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import LivePreview from '../../widgets/LivePreview/ui/LivePreview';
import { DEFAULT_PAGE_CONTENT, DEFAULT_THEME_SETTINGS, loadPageContent, loadThemeSettings, savePageContent, } from '../../shared/config/storefrontSettings';
import { useStoreData } from '../../shared/lib/hooks/useStoreData';
import { useUnsavedChangesGuard } from '../../shared/lib/hooks/useUnsavedChangesGuard';
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
export default function PageManager() {
    const [previewTheme, setPreviewTheme] = useState(() => loadThemeSettings());
  const storeData = useStoreData(DEFAULT_STORE_DATA);
    const [selectedPage, setSelectedPage] = useState(null);
    const [pageContent, setPageContent] = useState(() => loadPageContent());
    const [savedPageContent, setSavedPageContent] = useState(() => loadPageContent());
    const [validationMessage, setValidationMessage] = useState(null);
    const [homeAccordion, setHomeAccordion] = useState('hero');
    const [aboutAccordion, setAboutAccordion] = useState('story');
    const isDirty = useMemo(() => JSON.stringify(pageContent) !== JSON.stringify(savedPageContent), [pageContent, savedPageContent]);
    useEffect(() => {
        setPreviewTheme(loadThemeSettings());
        const persistedContent = loadPageContent();
        setPageContent(persistedContent);
        setSavedPageContent(persistedContent);
        const onStorage = (event) => {
            if (event.key === 'admin.theme_settings') {
                setPreviewTheme(loadThemeSettings());
            }
            if (event.key === 'admin.page_contents') {
                const latestContent = loadPageContent();
                setPageContent(latestContent);
                setSavedPageContent(latestContent);
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);
    useUnsavedChangesGuard(isDirty);
    const isUrl = (value) => {
        try {
            const parsed = new URL(value);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        }
        catch {
            return false;
        }
    };
    const validateContent = (targetPage) => {
        if (targetPage === 'home') {
            if (!pageContent.home.title.trim())
                return 'Home title khong duoc de trong.';
            if (!pageContent.home.subtitle.trim())
                return 'Home subtitle khong duoc de trong.';
            if (!pageContent.home.featuredTitle.trim())
                return 'Featured title khong duoc de trong.';
            if (!pageContent.home.featuredSubtitle.trim())
                return 'Featured subtitle khong duoc de trong.';
            if (!pageContent.home.heroImageUrl.trim() || !isUrl(pageContent.home.heroImageUrl.trim())) {
                return 'Hero Image URL khong hop le. Hay dung http(s) URL.';
            }
            if (pageContent.home.heroOverlayOpacity < 0 || pageContent.home.heroOverlayOpacity > 1) {
                return 'Hero Overlay Opacity phai nam trong khoang 0 den 1.';
            }
        }
        if (targetPage === 'about' && !pageContent.about.story.trim()) {
            return 'Story khong duoc de trong.';
        }
        return null;
    };
    const handleSaveChanges = () => {
        const error = validateContent(selectedPage);
        if (error) {
            setValidationMessage(error);
            return;
        }
        setSavedPageContent(pageContent);
        savePageContent(pageContent);
        setValidationMessage(null);
    };
    const handleNavigatePage = (nextPage) => {
        if (isDirty) {
            setValidationMessage('Ban can Save changes truoc khi chuyen sang trang tiep theo.');
            return;
        }
        setValidationMessage(null);
        setSelectedPage(nextPage);
    };
    if (!selectedPage) {
        return (<div className="p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h1 className="text-xl font-semibold text-slate-900">Pages Manager</h1>
          <p className="mt-1 text-sm text-slate-600">Choose a storefront page to edit its content blocks.</p>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Page Name</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr>
                  <td className="px-4 py-3 text-slate-800">Home Page</td>
                  <td className="px-4 py-3 text-slate-600">Landing</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => handleNavigatePage('home')} className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">
                      Edit
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-slate-800">About Us</td>
                  <td className="px-4 py-3 text-slate-600">Content</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => handleNavigatePage('about')} className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">
                      Edit
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-slate-800">Products</td>
                  <td className="px-4 py-3 text-slate-600">Catalog</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => handleNavigatePage('products')} className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">
                      Edit
                    </button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-slate-800">Contact</td>
                  <td className="px-4 py-3 text-slate-600">Utility</td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => handleNavigatePage('contact')} className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">
                      Edit
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>);
    }
    return (<div className="flex h-[calc(100vh-4rem)] w-full bg-slate-100">
      <aside className="w-[360px] shrink-0 border-r border-slate-200 bg-slate-50 p-4 overflow-y-auto">
        <button type="button" onClick={() => handleNavigatePage(null)} className="mb-4 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-white">
          Back to pages list
        </button>

        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Page Editor</p>
          <p className="mt-1 text-sm text-slate-700">
            {selectedPage === 'home' && 'Editing Home Page content blocks.'}
            {selectedPage === 'products' && 'Editing Products page preview.'}
            {selectedPage === 'about' && 'Editing About Us content blocks.'}
            {selectedPage === 'contact' && 'Editing Contact page content blocks.'}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <button type="button" onClick={handleSaveChanges} className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50" disabled={!isDirty}>
              Save changes
            </button>
            {isDirty ? (<span className="text-xs font-medium text-amber-600">Unsaved changes</span>) : (<span className="text-xs font-medium text-emerald-600">Saved</span>)}
          </div>
          {validationMessage && <p className="mt-2 text-xs font-medium text-red-600">{validationMessage}</p>}
        </div>

        {selectedPage === 'home' && (<div className="space-y-3">
            <AccordionSection title="Hero Banner" isOpen={homeAccordion === 'hero'} onToggle={() => setHomeAccordion(homeAccordion === 'hero' ? 'featured' : 'hero')}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Image URL</span>
                <input type="url" value={pageContent.home.heroImageUrl} onChange={(event) => setPageContent((prev) => ({
                ...prev,
                home: { ...prev.home, heroImageUrl: event.target.value },
            }))} className="h-10 w-full rounded border border-slate-300 px-3 text-sm outline-none focus:border-slate-600"/>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Title</span>
                <input type="text" value={pageContent.home.title} onChange={(event) => setPageContent((prev) => ({ ...prev, home: { ...prev.home, title: event.target.value } }))} className="h-10 w-full rounded border border-slate-300 px-3 text-sm outline-none focus:border-slate-600"/>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Subtitle</span>
                <textarea value={pageContent.home.subtitle} onChange={(event) => setPageContent((prev) => ({ ...prev, home: { ...prev.home, subtitle: event.target.value } }))} rows={3} className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-600"/>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  Overlay Opacity: {pageContent.home.heroOverlayOpacity.toFixed(1)}
                </span>
                <input type="range" min={0} max={1} step={0.1} value={pageContent.home.heroOverlayOpacity} onChange={(event) => setPageContent((prev) => ({
                ...prev,
                home: { ...prev.home, heroOverlayOpacity: Number(event.target.value) },
            }))} className="w-full accent-slate-900"/>
              </label>
            </AccordionSection>

            <AccordionSection title="Featured Section" isOpen={homeAccordion === 'featured'} onToggle={() => setHomeAccordion(homeAccordion === 'featured' ? 'hero' : 'featured')}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Title</span>
                <input type="text" value={pageContent.home.featuredTitle} onChange={(event) => setPageContent((prev) => ({
                ...prev,
                home: { ...prev.home, featuredTitle: event.target.value },
            }))} className="h-10 w-full rounded border border-slate-300 px-3 text-sm outline-none focus:border-slate-600"/>
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Subtitle</span>
                <textarea value={pageContent.home.featuredSubtitle} onChange={(event) => setPageContent((prev) => ({
                ...prev,
                home: { ...prev.home, featuredSubtitle: event.target.value },
            }))} rows={3} className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-600"/>
              </label>
            </AccordionSection>
          </div>)}

        {selectedPage === 'about' && (<AccordionSection title="Story" isOpen={aboutAccordion === 'story'} onToggle={() => setAboutAccordion('story')}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Paragraphs</span>
              <textarea value={pageContent.about.story} onChange={(event) => setPageContent((prev) => ({ ...prev, about: { ...prev.about, story: event.target.value } }))} rows={10} className="w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-600"/>
            </label>
          </AccordionSection>)}

        {selectedPage === 'contact' && (<div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Contact page content is now managed by the storefront defaults.
          </div>)}

        {selectedPage === 'products' && (<div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Products page content is managed by catalog defaults. Theme changes still apply in preview.
          </div>)}
      </aside>

      <section className="flex-1 min-w-0">
        <LivePreview themeData={previewTheme ?? DEFAULT_THEME_SETTINGS} pageData={pageContent ?? DEFAULT_PAGE_CONTENT} activePage={selectedPage} storeData={storeData}/>
      </section>
    </div>);
}

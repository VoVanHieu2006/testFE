import { useEffect } from 'react';
import { ArrowRight, ChevronDown, Package, Search, ShoppingCart, User } from 'lucide-react';

const featuredProducts = [
  { id: 1, name: 'Classic Cotton T-Shirt', price: '$29.99', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', badge: 'In Stock', desc: 'A timeless wardrobe essential crafted from premium cotton for all-day comfort and a relaxed fit.' },
  { id: 2, name: 'Slim Fit Jeans', price: '$59.99', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80', badge: 'In Stock', desc: 'Modern slim fit jeans with stretch fabric. Designed for both casual and semi-formal use.' },
  { id: 3, name: 'Casual Hoodie', price: '$79.99', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80', badge: 'In Stock', desc: 'A soft and warm hoodie with clean lines, minimal branding, and a practical kangaroo pocket.' },
  { id: 4, name: 'Premium Polo Shirt', price: '$39.99', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80', badge: 'In Stock', desc: 'Fine pique texture with balanced structure and softness for a polished everyday look.' },
  { id: 5, name: 'Knit Beanie Hat', price: '$19.99', image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80', badge: 'In Stock', desc: 'Warm and cozy knit beanie hat perfect for cold weather. One-size-fits-most with a ribbed design.' },
  { id: 6, name: 'Athletic Running Shorts', price: '$34.99', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80', badge: 'In Stock', desc: 'Lightweight and breathable running shorts with built-in liner. Features moisture-wicking fabric.' },
  { id: 7, name: 'Leather Crossbody Bag', price: '$89.99', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80', badge: 'In Stock', desc: 'Compact and stylish crossbody bag crafted from genuine leather with premium hardware.' },
  { id: 8, name: 'Canvas Sneakers', price: '$69.99', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80', badge: 'In Stock', desc: 'Lightweight and breathable canvas sneakers with a vulcanized rubber sole.' },
  { id: 9, name: 'Premium Polo Shirt V2', price: '$49.99', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80', badge: 'In Stock', desc: 'Updated edition with fine pique texture. Suitable for casual and business-casual settings.' },
  { id: 10, name: 'Premium Polo Shirt', price: '$39.99', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80', badge: 'In Stock', desc: 'A versatile polo shirt with fine pique texture. Available in cotton and polyester.' },
  { id: 11, name: 'Casual Hoodie V2', price: '$89.99', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80', badge: 'In Stock', desc: 'Updated edition with richer fabric blend and elevated fit for daily wear.' },
  { id: 12, name: 'Casual Hoodie', price: '$79.99', image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80', badge: 'In Stock', desc: 'Cozy and stylish hoodie made from a soft cotton-polyester blend.' },
];

const categoryCards = [
  { name: 'Tops', count: '6+ Items', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=700&q=80' },
  { name: 'Bottoms', count: '3+ Items', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=700&q=80' },
  { name: 'Footwear', count: '1+ Items', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&q=80' },
  { name: 'Accessories', count: '2+ Items', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&q=80' },
];

const productCardClassMap = {
  shadow: 'shadow-sm',
  border: 'border',
  flat: '',
};

export default function LivePreview({ themeData, pageData, activePage, storeData }) {
  const cardClass = productCardClassMap[themeData.productCard.style] || '';

  useEffect(() => {
    const fontId = 'live-preview-google-font';
    let link = document.getElementById(fontId);
    if (!link) {
      link = document.createElement('link');
      link.id = fontId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = `https://fonts.googleapis.com/css2?family=${themeData.typography.fontFamily.replace(/ /g, '+')}:wght@400;500;600;700;800&display=swap`;
  }, [themeData.typography.fontFamily]);

  const renderProductGrid = (products, compact = false) => (
    <div className={`grid grid-cols-4 ${compact ? 'gap-4' : 'gap-7'}`}>
      {products.map((product) => (
        <article
          key={product.id}
          className={`group flex cursor-pointer flex-col overflow-hidden ${cardClass}`}
          style={{
            borderRadius: `${themeData.layout.borderRadius}px`,
            backgroundColor: themeData.productCard.backgroundColor,
            color: themeData.productCard.textColor,
            borderColor: themeData.productCard.style === 'border' ? `${themeData.colors.textPrimary}20` : 'transparent',
          }}
        >
          <div className={`relative w-full overflow-hidden ${compact ? 'aspect-[4/3]' : 'aspect-[3/4]'}`} style={{ backgroundColor: `${themeData.colors.textPrimary}08` }}>
            <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute left-2.5 top-2.5 rounded px-2 py-1 text-[10px] font-bold uppercase text-white" style={{ backgroundColor: '#10b981' }}>
              {product.badge}
            </div>
          </div>

          <div className={`flex flex-1 flex-col text-left ${compact ? 'p-3' : 'p-4'}`}>
            <h3 className={`mb-1 font-semibold ${compact ? 'text-sm' : 'text-[17px]'}`}>{product.name}</h3>
            <p className={`line-clamp-3 opacity-70 ${compact ? 'mb-2 text-xs leading-5' : 'mb-3 text-sm leading-5'}`}>{product.desc}</p>
            <div className="mt-auto flex items-center justify-between">
              <span className={`${compact ? 'text-[28px]' : 'text-lg'} font-bold`} style={{ color: themeData.colors.primary, fontSize: compact ? '29px' : undefined }}>
                {product.price}
              </span>
              <button
                className={`flex items-center justify-center text-white transition-opacity hover:opacity-90 ${compact ? 'h-8 w-8' : 'h-9 w-9'}`}
                style={{ backgroundColor: '#0f172a', borderRadius: `${Math.min(themeData.layout.borderRadius, 7)}px` }}
              >
                <ShoppingCart className="h-4 w-4" />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-[#e5e7eb] p-6">
      <div className="mx-auto w-full max-w-[1280px]">
        <div
          className="min-h-[800px] overflow-hidden shadow-2xl"
          style={{
            fontFamily: `"${themeData.typography.fontFamily}", sans-serif`,
            backgroundColor: themeData.colors.backgroundMain,
            color: themeData.colors.textPrimary,
          }}
        >
          <header className="sticky top-0 z-40 border-b" style={{ backgroundColor: themeData.header.backgroundColor, color: themeData.header.textColor, borderColor: `${themeData.header.textColor}15` }}>
            <div className="mx-auto flex w-full max-w-[1060px] items-center gap-10 px-4 py-3">
              <div className="flex items-center gap-2.5">
                {storeData.logoUrl ? (
                  <img src={storeData.logoUrl} alt="Store logo" className="h-6 w-6 rounded object-cover" />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded text-white" style={{ backgroundColor: themeData.colors.primary }}>
                    <Package className="h-3.5 w-3.5" />
                  </div>
                )}
                <span className="text-sm font-bold tracking-tight uppercase">{storeData.storeName}</span>
              </div>

              <nav className="flex items-center gap-7 text-xs font-semibold">
                <span className={`cursor-default border-b pb-1 transition-opacity ${activePage === 'home' ? '' : 'border-transparent opacity-70'}`} style={{ borderColor: activePage === 'home' ? themeData.colors.primary : 'transparent', color: activePage === 'home' ? themeData.colors.primary : themeData.header.textColor }}>Home</span>
                <span className={`cursor-default border-b pb-1 transition-opacity ${activePage === 'products' ? '' : 'border-transparent opacity-70'}`} style={{ borderColor: activePage === 'products' ? themeData.colors.primary : 'transparent', color: activePage === 'products' ? themeData.colors.primary : themeData.header.textColor }}>Shop / Products</span>
                <span className={`cursor-default border-b pb-1 transition-opacity ${activePage === 'about' ? '' : 'border-transparent opacity-70'}`} style={{ borderColor: activePage === 'about' ? themeData.colors.primary : 'transparent', color: activePage === 'about' ? themeData.colors.primary : themeData.header.textColor }}>About Us</span>
                <span className={`cursor-default border-b pb-1 transition-opacity ${activePage === 'contact' ? '' : 'border-transparent opacity-70'}`} style={{ borderColor: activePage === 'contact' ? themeData.colors.primary : 'transparent', color: activePage === 'contact' ? themeData.colors.primary : themeData.header.textColor }}>Contact</span>
              </nav>

              <div className="ml-auto flex items-center gap-5">
                <div className="flex w-[220px] items-center rounded-xl px-3 py-2" style={{ backgroundColor: '#f1f5f9' }}>
                  <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
                  <input type="text" placeholder="Search products..." className="w-full border-none bg-transparent text-xs text-gray-900 outline-none placeholder:text-gray-500" />
                </div>
                <User className="h-4 w-4 opacity-80" style={{ color: themeData.header.textColor }} />
                <ShoppingCart className="h-4 w-4 opacity-80" style={{ color: themeData.header.textColor }} />
              </div>
            </div>
          </header>

          {activePage === 'home' && (
            <main className="mx-auto min-h-[600px] w-full max-w-[1060px] px-4 py-5">
              <section
                className="relative flex h-[250px] flex-col justify-center overflow-hidden rounded-xl px-10"
                style={{ backgroundImage: `url(${pageData.home.heroImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${pageData.home.heroOverlayOpacity})` }} />
                <div className="z-10 mx-auto max-w-3xl text-center text-white">
                  <h1 className="mb-4 text-[44px] font-extrabold leading-[1.08]">{pageData.home.title}</h1>
                  <p className="mx-auto mb-6 max-w-[620px] text-base opacity-90">{pageData.home.subtitle}</p>
                  <button className="rounded-xl px-7 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: themeData.colors.primary, borderRadius: `${themeData.layout.borderRadius}px` }}>
                    Shop Now
                  </button>
                </div>
              </section>

              <section className="py-10">
                <div className="mb-5 flex items-end justify-between">
                  <div>
                    <h2 className="mb-1 text-[34px] font-bold leading-none">{pageData.home.featuredTitle}</h2>
                    <p className="text-sm opacity-60">{pageData.home.featuredSubtitle}</p>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: themeData.colors.primary }}>
                    View all <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
                {renderProductGrid(featuredProducts.slice(0, 4), true)}
              </section>

              <section className="pb-10 pt-2">
                <h3 className="mb-4 text-[34px] font-bold leading-none">Shop by Category</h3>
                <div className="grid grid-cols-4 gap-4">
                  {categoryCards.map((item) => (
                    <article key={item.name} className="group relative h-[210px] overflow-hidden rounded-xl">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
                      <div className="absolute bottom-3 left-3 text-white">
                        <p className="text-lg font-bold leading-none">{item.name}</p>
                        <p className="mt-1 text-xs opacity-80">{item.count}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </main>
          )}

          {activePage === 'products' && (
            <main className="mx-auto flex min-h-[600px] w-full max-w-[1060px] gap-8 px-4 py-6">
              <aside className="w-[170px] shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-[22px] font-bold leading-none">Filters</h3>
                  <span className="text-[10px] font-bold uppercase" style={{ color: themeData.colors.primary }}>Clear all</span>
                </div>

                <div className="mt-6 border-t pt-4" style={{ borderColor: `${themeData.colors.textPrimary}18` }}>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-wider opacity-70">Price range</p>
                  <input type="range" className="w-full" style={{ accentColor: themeData.colors.primary }} />
                  <div className="mt-3 flex items-center justify-between gap-2 text-[11px]">
                    <span className="rounded border px-3 py-1.5 opacity-80" style={{ borderColor: `${themeData.colors.textPrimary}18` }}>$ 0</span>
                    <span className="opacity-50">-</span>
                    <span className="rounded border px-3 py-1.5 opacity-80" style={{ borderColor: `${themeData.colors.textPrimary}18` }}>$ 500</span>
                  </div>
                </div>

                <div className="mt-5 border-t pt-4" style={{ borderColor: `${themeData.colors.textPrimary}18` }}>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-wider opacity-70">Category</p>
                  <div className="space-y-2 text-xs opacity-80">
                    <label className="flex items-center gap-2"><input type="checkbox" /> Tops</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Bottoms</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Footwear</label>
                    <label className="flex items-center gap-2"><input type="checkbox" /> Accessories</label>
                  </div>
                </div>

                <div className="mt-5 border-t pt-4" style={{ borderColor: `${themeData.colors.textPrimary}18` }}>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-wider opacity-70">Size / Specification</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['S', 'M', 'L', 'XL', '30', '32', '34', '36', 'XXL', '39', '40', '41'].map((size) => (
                      <span key={size} className="rounded border px-1 py-1 text-center text-[10px] opacity-70" style={{ borderColor: `${themeData.colors.textPrimary}18` }}>
                        {size}
                      </span>
                    ))}
                  </div>
                </div>
              </aside>

              <section className="flex-1">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-xs opacity-70">Showing 12 products</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase opacity-60">Sort by</span>
                    <button className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs" style={{ borderColor: `${themeData.colors.textPrimary}18` }}>
                      Newest Arrivals <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {renderProductGrid(featuredProducts.slice(0, 12), true)}
              </section>
            </main>
          )}

          {activePage === 'about' && (
            <main className="mx-auto w-full max-w-[1060px] px-4 py-9">
              <div className="mb-6 text-center">
                <h1 className="text-[40px] font-bold leading-none">About {storeData.storeName}</h1>
                <p className="mt-2 text-sm opacity-65">Curating the best modern essentials for your lifestyle.</p>
              </div>

              <div className="mx-auto max-w-[640px]">
                <img src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&q=80" alt="About hero" className="h-[230px] w-full rounded-xl object-cover" />

                <div className="mt-6 space-y-6 text-sm leading-7 opacity-85">
                  {pageData.about.story.split('\n').filter(Boolean).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>

                <div className="mt-7 grid grid-cols-3 gap-6 border-t pt-5" style={{ borderColor: `${themeData.colors.textPrimary}18` }}>
                  <div>
                    <h3 className="text-xl font-bold">Quality First</h3>
                    <p className="mt-1 text-xs opacity-70">We never compromise on materials or craftsmanship. Built to last.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Modern Design</h3>
                    <p className="mt-1 text-xs opacity-70">Clean lines, functional forms, and timeless aesthetics.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Sustainable</h3>
                    <p className="mt-1 text-xs opacity-70">Working towards a greener future with eco-friendly packaging.</p>
                  </div>
                </div>
              </div>
            </main>
          )}

          {activePage === 'contact' && (
            <main className="mx-auto w-full max-w-[1060px] px-4 py-9">
              <div className="mb-7 text-center">
                <h1 className="mb-2 text-[42px] font-bold leading-none">Contact Us</h1>
                <p className="mx-auto max-w-[520px] text-sm opacity-65">We would love to hear from you. Send us a message and we will respond as soon as possible.</p>
              </div>

              <div className="mx-auto max-w-[560px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-[11px] font-semibold text-gray-700">First Name</label>
                    <input type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black" placeholder="Jane" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-semibold text-gray-700">Last Name</label>
                    <input type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black" placeholder="Doe" />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="mb-2 block text-[11px] font-semibold text-gray-700">Email Address</label>
                  <input type="email" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black" placeholder="jane@example.com" />
                </div>

                <div className="mb-4">
                  <label className="mb-2 block text-[11px] font-semibold text-gray-700">Subject</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black">
                    <option>General Inquiry</option>
                    <option>Order Support</option>
                    <option>Returns & Exchanges</option>
                  </select>
                </div>

                <div className="mb-5">
                  <label className="mb-2 block text-[11px] font-semibold text-gray-700">Message</label>
                  <textarea rows={5} className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black" placeholder="How can we help you?" />
                </div>

                <button className="w-full py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: themeData.colors.primary, borderRadius: `${themeData.layout.borderRadius}px` }}>
                  Send Message
                </button>
              </div>
            </main>
          )}

          <footer className="mt-auto border-t" style={{ backgroundColor: themeData.footer.backgroundColor, color: themeData.footer.textColor, borderColor: `${themeData.footer.textColor}20` }}>
            <div className="mx-auto grid w-full max-w-[1060px] grid-cols-5 gap-10 px-4 py-10">
              <div className="col-span-2">
                <div className="mb-4 flex items-center gap-2.5">
                  {storeData.logoUrl ? (
                    <img src={storeData.logoUrl} alt="Store logo" className="h-6 w-6 rounded object-cover" />
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-tight">
                      <div className="flex h-6 w-6 items-center justify-center rounded text-white" style={{ backgroundColor: themeData.colors.primary }}>
                        <Package className="h-3.5 w-3.5" />
                      </div>
                      {storeData.storeName}
                    </div>
                  )}
                </div>
                <p className="max-w-sm text-sm leading-6 opacity-70">Premium digital solutions for the modern creator. Join over 50,000+ customers building the future.</p>
              </div>

              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider opacity-90">About Us</h4>
                <ul className="space-y-2 text-sm opacity-70">
                  <li>Our Story</li>
                  <li>Careers</li>
                  <li>Sustainability</li>
                  <li>Newsroom</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider opacity-90">Customer Support</h4>
                <ul className="space-y-2 text-sm opacity-70">
                  <li>Help Center</li>
                  <li>Track Order</li>
                  <li>Returns & Exchanges</li>
                  <li>Contact Us</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider opacity-90">Quick Links</h4>
                <ul className="space-y-2 text-sm opacity-70">
                  <li>Sale</li>
                  <li>Size Guide</li>
                  <li>Gift Cards</li>
                  <li>Store Locator</li>
                </ul>
              </div>
            </div>

            <div className="border-t" style={{ borderColor: `${themeData.footer.textColor}20` }}>
              <div className="mx-auto flex w-full max-w-[1060px] items-center justify-between px-4 py-3 text-xs opacity-60">
                <p>© {new Date().getFullYear()} {storeData.storeName}. All rights reserved.</p>
                <div className="flex gap-6">
                  <span>Privacy Policy</span>
                  <span>Terms of Service</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

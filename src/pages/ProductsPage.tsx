import SEO from "@/components/SEO";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, ShoppingCart, Check, Eye, X, Heart, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { categories } from "@/data/siteData";
import productPesticide from "@/assets/product-pesticide.jpg";
import productFertilizer from "@/assets/product-fertilizer.jpg";
import productSeeds from "@/assets/product-seeds.jpg";
import productGrowth from "@/assets/product-growth.jpg";
import productTools from "@/assets/product-tools.jpg";

const fallbackImages: Record<string, string> = {
  pesticides: productPesticide,
  fertilizers: productFertilizer,
  seeds: productSeeds,
  "growth-promoters": productGrowth,
  tools: productTools,
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }),
};

interface Product {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  benefits: string[] | null;
  usage_instructions: string | null;
  is_active: boolean;
}

type SortOption = "newest" | "price-low" | "price-high" | "name-az";

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [stockOnly, setStockOnly] = useState(false);

  const { addItem } = useCart();
  const { isInWishlist, toggle: toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const { toast } = useToast();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false })
      .then(({ data }) => {
        const items = data || [];
        setProducts(items);
        if (items.length > 0) {
          const maxP = Math.max(...items.map(p => p.price));
          setPriceRange([0, Math.ceil(maxP / 100) * 100]);
        }
        // Preload all product images for instant display
        items.forEach((p) => {
          const src = p.image_url || fallbackImages[p.category] || productPesticide;
          const img = new Image();
          img.src = src;
        });
        setLoading(false);
      });
  }, []);

  const maxPrice = useMemo(() => {
    if (products.length === 0) return 10000;
    return Math.ceil(Math.max(...products.map(p => p.price)) / 100) * 100;
  }, [products]);

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      const matchesStock = !stockOnly || p.stock > 0;
      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    });

    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "name-az": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break; // newest is default from DB
    }
    return result;
  }, [products, search, activeCategory, sortBy, priceRange, stockOnly]);

  const handleAdd = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: product.price, category: product.category, image_url: product.image_url || fallbackImages[product.category], stock: product.stock });
    setAddedIds((prev) => new Set(prev).add(product.id));
    toast({ title: `${product.name} added to cart!` });
    setTimeout(() => setAddedIds((prev) => { const n = new Set(prev); n.delete(product.id); return n; }), 2000);
  };

  const handleWishlist = (productId: string) => {
    if (!user) { toast({ title: "Please sign in to add to wishlist", variant: "destructive" }); return; }
    toggleWishlist(productId);
    toast({ title: isInWishlist(productId) ? "Removed from wishlist" : "Added to wishlist!" });
  };

  return (
    <div className="min-h-screen pt-16 lg:pt-24">
      <SEO title="Agricultural Products – Pesticides, Fertilizers & Seeds" description="Browse premium pesticides, fertilizers, seeds, growth promoters & farming tools. Best prices in Kashmir with home delivery." />

      <section className="hero-gradient py-8 md:py-16">
        <div className="container-custom text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-2 md:mb-3">Our Products</h1>
          <p className="text-sm md:text-base text-primary-foreground/80 max-w-xl mx-auto">Premium agricultural solutions for every farming need.</p>
        </div>
      </section>

      <div className="container-custom py-4 md:py-8">
        {/* Search + Sort + Filter */}
        <div className="flex gap-2 mb-4 md:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 text-base" />
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[140px] h-11 hidden md:flex">
              <ArrowUpDown className="h-4 w-4 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low</SelectItem>
              <SelectItem value="price-high">Price: High</SelectItem>
              <SelectItem value="name-az">Name: A-Z</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="lg:hidden h-11 px-3 border-primary text-primary shrink-0"
            onClick={() => setFilterOpen(true)}
          >
            <Filter className="h-4 w-4 mr-1" /> Filter
          </Button>
        </div>

        {/* Desktop category filters + price */}
        <div className="hidden lg:flex items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2 flex-1">
            <Button variant={activeCategory === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveCategory("all")}
              className={activeCategory === "all" ? "bg-primary text-primary-foreground" : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"}>All</Button>
            {categories.map((cat) => (
              <Button key={cat.id} variant={activeCategory === cat.id ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat.id)}
                className={activeCategory === cat.id ? "bg-primary text-primary-foreground" : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"}>
                {cat.icon} {cat.name}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-3 min-w-[200px]">
            <span className="text-xs text-muted-foreground whitespace-nowrap">₹{priceRange[0]} - ₹{priceRange[1]}</span>
            <Slider
              min={0} max={maxPrice} step={50}
              value={priceRange}
              onValueChange={(v) => setPriceRange(v as [number, number])}
              className="w-[140px]"
            />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
            <input type="checkbox" checked={stockOnly} onChange={(e) => setStockOnly(e.target.checked)} className="rounded" />
            In stock only
          </label>
        </div>

        {/* Mobile filter slide panel */}
        <AnimatePresence>
          {filterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                onClick={() => setFilterOpen(false)}
              />
              <motion.div
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="lg:hidden fixed right-0 top-0 bottom-0 w-72 bg-card border-l border-border z-50 flex flex-col shadow-2xl"
              >
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground text-lg">Filter & Sort</h3>
                  <button onClick={() => setFilterOpen(false)} className="p-2 rounded-lg hover:bg-accent">
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                  {/* Sort */}
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">Sort By</p>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="name-az">Name: A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price range */}
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">Price Range</p>
                    <p className="text-xs text-muted-foreground mb-2">₹{priceRange[0]} - ₹{priceRange[1]}</p>
                    <Slider min={0} max={maxPrice} step={50} value={priceRange} onValueChange={(v) => setPriceRange(v as [number, number])} />
                  </div>

                  {/* In stock */}
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="checkbox" checked={stockOnly} onChange={(e) => setStockOnly(e.target.checked)} className="rounded" />
                    In stock only
                  </label>

                  {/* Categories */}
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">Category</p>
                    <div className="space-y-1">
                      <button
                        onClick={() => { setActiveCategory("all"); setFilterOpen(false); }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          activeCategory === "all" ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground"
                        }`}
                      >All Products</button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => { setActiveCategory(cat.id); setFilterOpen(false); }}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                            activeCategory === cat.id ? "bg-primary text-primary-foreground" : "hover:bg-accent text-foreground"
                          }`}
                        >
                          <span className="text-lg">{cat.icon}</span> {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-border">
                  <Button className="w-full bg-primary text-primary-foreground" onClick={() => setFilterOpen(false)}>
                    Show {filtered.length} Products
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Active filters */}
        {(activeCategory !== "all" || stockOnly || priceRange[0] > 0 || priceRange[1] < maxPrice) && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-muted-foreground">Filters:</span>
            {activeCategory !== "all" && (
              <button onClick={() => setActiveCategory("all")} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
                {categories.find(c => c.id === activeCategory)?.icon} {categories.find(c => c.id === activeCategory)?.name}
                <X className="h-3 w-3 ml-1" />
              </button>
            )}
            {stockOnly && (
              <button onClick={() => setStockOnly(false)} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
                In stock <X className="h-3 w-3 ml-1" />
              </button>
            )}
            {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
              <button onClick={() => setPriceRange([0, maxPrice])} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">
                ₹{priceRange[0]}-₹{priceRange[1]} <X className="h-3 w-3 ml-1" />
              </button>
            )}
          </div>
        )}

        {/* Results count */}
        <p className="text-xs text-muted-foreground mb-4">{filtered.length} product{filtered.length !== 1 ? "s" : ""} found</p>

        {loading ? (
          <div className="text-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No products found. Try adjusting your filters.</p>
            <Button variant="outline" className="mt-4" onClick={() => { setActiveCategory("all"); setSearch(""); setPriceRange([0, maxPrice]); setStockOnly(false); }}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {filtered.map((product, i) => (
              <motion.div key={product.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="relative rounded-xl overflow-hidden bg-card border border-border group h-full flex flex-col hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:-translate-y-1">
                  <Link to={`/products/${product.id}`} className="block aspect-square overflow-hidden bg-muted relative">
                    <img
                      src={product.image_url || fallbackImages[product.category] || productPesticide}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      width={400} height={400}
                    />
                    <div className="hidden md:flex absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-all duration-300 items-center justify-center">
                      <span className="bg-background/90 text-foreground text-xs font-semibold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" /> Quick View
                      </span>
                    </div>
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="absolute top-2 left-2 bg-secondary text-secondary-foreground text-[9px] md:text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Only {product.stock} left!
                      </span>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-foreground/40 flex items-center justify-center">
                        <span className="bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded-full">Out of Stock</span>
                      </div>
                    )}
                  </Link>

                  {/* Wishlist button */}
                  <button
                    onClick={(e) => { e.preventDefault(); handleWishlist(product.id); }}
                    className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
                  >
                    <Heart className={`h-4 w-4 transition-colors ${isInWishlist(product.id) ? "text-destructive fill-destructive" : "text-muted-foreground"}`} />
                  </button>

                  <div className="p-3 md:p-5 flex flex-col flex-1">
                    <span className="text-[10px] md:text-xs font-medium text-primary bg-accent rounded-full px-2 md:px-3 py-0.5 md:py-1 self-start">
                      {categories.find(c => c.id === product.category)?.name || product.category}
                    </span>
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-semibold text-foreground mt-2 md:mt-3 mb-1 text-sm md:text-base hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
                    </Link>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2 md:mb-3 flex-1 hidden sm:block">{product.description}</p>

                    {product.benefits && product.benefits.length > 0 && (
                      <div className="hidden md:flex flex-wrap gap-1 mb-3">
                        {product.benefits.slice(0, 3).map((b) => (
                          <span key={b} className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full">✓ {b}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-2 md:mb-3">
                      <span className="text-lg md:text-xl font-bold text-primary">₹{product.price}</span>
                      <span className={`text-[10px] md:text-xs font-medium ${product.stock > 0 ? "text-primary" : "text-destructive"}`}>
                        {product.stock > 0 ? <span className="hidden md:inline">{product.stock} in stock</span> : ""}
                      </span>
                    </div>

                    <div className="flex gap-1.5 md:gap-2">
                      <Button
                        onClick={(e) => { e.preventDefault(); handleAdd(product); }}
                        disabled={product.stock <= 0}
                        size="sm"
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-1 md:gap-2 text-xs md:text-sm h-9 md:h-10"
                      >
                        {addedIds.has(product.id) ? <><Check className="h-3.5 w-3.5" /> Added</> : <><ShoppingCart className="h-3.5 w-3.5" /> <span className="hidden xs:inline">Add to</span> Cart</>}
                      </Button>
                      <Link to={`/products/${product.id}`} className="hidden md:block">
                        <Button variant="outline" size="icon" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground h-10 w-10">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Leaf, Award, ArrowRight, ShoppingCart, RefreshCw, Microscope, Bug, FlaskConical, CalendarDays, ScanLine, Users, Package, MapPin } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { categories } from "@/data/siteData";
import SEO from "@/components/SEO";
import heroNew from "@/assets/hero-new.jpg";
import productPesticide from "@/assets/product-pesticide.jpg";
import productFertilizer from "@/assets/product-fertilizer.jpg";
import productSeeds from "@/assets/product-seeds.jpg";
import productGrowth from "@/assets/product-growth.jpg";
import productTools from "@/assets/product-tools.jpg";

const categoryImages: Record<string, string> = {
  pesticides: productPesticide,
  fertilizers: productFertilizer,
  seeds: productSeeds,
  "growth-promoters": productGrowth,
  tools: productTools,
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};




const stats = [
  { number: "500+", label: "Happy Farmers", icon: Users },
  { number: "200+", label: "Products", icon: Package },
  { number: "15+", label: "Years Experience", icon: Award },
  { number: "50km", label: "Delivery Range", icon: MapPin },
];

export default function HomePage() {
  const isMobile = useIsMobile();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const { addItem } = useCart();
  const { toast } = useToast();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, isMobile ? 0 : 150]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchProducts = useCallback(() => {
    return supabase
      .from("products")
      .select("id,name,category,description,price,stock,image_url,is_active,created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        const products = data || [];
        setFeaturedProducts(products);
        products.forEach((p) => {
          const src = p.image_url || categoryImages[p.category] || productPesticide;
          const img = new Image();
          img.src = src;
        });
      });
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (window.scrollY > 0 || isRefreshing) return;
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0) setPullDistance(Math.min(delta * 0.4, 80));
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 60) {
      setIsRefreshing(true);
      await fetchProducts();
      toast({ title: "Refreshed!", description: "Latest products loaded." });
      setIsRefreshing(false);
    }
    setPullDistance(0);
  }, [pullDistance, fetchProducts, toast]);

  return (
    <div className="min-h-screen" ref={containerRef} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {/* Pull-to-refresh */}
      <div className="lg:hidden flex justify-center overflow-hidden transition-all duration-300" style={{ height: pullDistance }}>
        <RefreshCw className={`h-6 w-6 text-primary mt-2 transition-transform ${isRefreshing ? "animate-spin" : ""}`} style={{ transform: `rotate(${pullDistance * 3}deg)` }} />
      </div>

      <SEO
        title="Mughal Grow Hub – Kashmir's Premier Agriculture Solutions"
        description="Premium pesticides, fertilizers, seeds & farming tools. Trusted by 500+ farmers in Kashmir. Order online with home delivery across Anantnag."
      />

      {/* ===== HERO ===== */}
      <section className="relative min-h-[92vh] md:min-h-[95vh] flex items-end overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          <img src={heroNew} alt="Lush green terraced fields in Kashmir valley" className="w-full h-full object-cover" loading="eager" fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/50 to-transparent" />
        </motion.div>

        <div className="container-custom relative z-10 pb-16 md:pb-24 pt-32">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="max-w-3xl">
            <div className="flex items-center gap-2 mb-5">
              <span className="h-px w-8 bg-secondary" />
              <span className="text-secondary text-xs font-semibold uppercase tracking-[0.2em]">Since 2010 · Anantnag, Kashmir</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-background leading-[1.1] mb-5">
              Grow Better.<br />
              <span className="text-secondary">Harvest More.</span>
            </h1>
            <p className="text-base md:text-lg text-background/70 mb-8 max-w-xl leading-relaxed">
              Kashmir's most trusted agriculture store. Premium pesticides, fertilizers, and expert guidance — everything your farm needs, delivered to your door.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold text-base px-8 gap-2 h-12 rounded-xl">
                  Explore Products <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/track-order">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-background/30 text-background bg-background/10 hover:bg-background/20 font-semibold text-base px-8 h-12 rounded-xl">
                  Track Your Order
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="bg-background/10 backdrop-blur-sm border border-background/10 rounded-xl px-4 py-3 md:py-4 text-center">
                <stat.icon className="h-5 w-5 text-secondary mx-auto mb-1.5" />
                <p className="text-xl md:text-2xl font-bold text-background font-display">{stat.number}</p>
                <p className="text-[11px] text-background/60 font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== TRUST MARQUEE ===== */}
      <section className="bg-primary py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex items-center gap-8 mr-8">
              {["✓ 100% Genuine Products", "✓ Expert Farm Advisory", "✓ Home Delivery Available", "✓ 500+ Farmers Trust Us", "✓ 15+ Years Experience", "✓ Kashmir's Own Agri Store"].map((text) => (
                <span key={text + idx} className="text-primary-foreground/90 text-sm font-medium tracking-wide">{text}</span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="section-padding" aria-label="Product Categories">
        <div className="container-custom">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="mb-12">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-px w-8 bg-secondary" />
              <span className="text-secondary text-xs font-semibold uppercase tracking-[0.2em]">What We Offer</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Shop by Category</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-5">
            {categories.map((cat, i) => (
              <motion.div key={cat.id} custom={i + 1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to="/products" className="group block relative rounded-2xl overflow-hidden aspect-[4/5]">
                  <img src={categoryImages[cat.id]} alt={`${cat.name} products`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <span className="text-2xl">{cat.icon}</span>
                    <h3 className="font-display font-semibold text-background text-sm mt-1">{cat.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="section-padding bg-muted/50" aria-label="Featured Products">
        <div className="container-custom">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="h-px w-8 bg-secondary" />
                <span className="text-secondary text-xs font-semibold uppercase tracking-[0.2em]">Best Sellers</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Featured Products</h2>
            </div>
            <Link to="/products" className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          {/* Mobile Carousel */}
          <div className="lg:hidden">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-3">
                {featuredProducts.map((product) => (
                  <CarouselItem key={product.id} className="pl-3 basis-[72%] sm:basis-1/2">
                    <ProductCard product={product} categoryImages={categoryImages} addItem={addItem} toast={toast} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <p className="text-center text-xs text-muted-foreground mt-4">← Swipe to browse →</p>
          </div>

          {/* Desktop Grid */}
          <div className="hidden lg:grid grid-cols-4 gap-5">
            {featuredProducts.map((product, i) => (
              <motion.div key={product.id} custom={i + 1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <ProductCard product={product} categoryImages={categoryImages} addItem={addItem} toast={toast} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10 md:hidden">
            <Link to="/products">
              <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-xl">
                View All Products <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>


      {/* ===== FARMER ADVISORY HUB ===== */}
      <section className="section-padding" aria-label="Farmer Advisory Hub">
        <div className="container-custom">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-px w-8 bg-secondary" />
              <span className="text-secondary text-xs font-semibold uppercase tracking-[0.2em]">Free Resources</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">Farmer Resource Center</h2>
            <p className="text-muted-foreground max-w-xl">AI-powered tools and expert guides tailored for Kashmir's crops and climate.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {([
              { icon: Microscope, title: "Crop Advisor", desc: "Get personalized crop recommendations and best practices.", link: "/crop-advisor", color: "bg-primary" },
              { icon: ScanLine, title: "Disease Detector", desc: "Upload a leaf photo and detect diseases with AI analysis.", link: "/disease-detector", color: "bg-secondary" },
              { icon: Bug, title: "Pest Guide", desc: "Identify pests with treatment protocols and spray schedules.", link: "/pest-guide", color: "bg-primary" },
              { icon: FlaskConical, title: "Fertilizer Guide", desc: "Complete dosage and application guide for all fertilizers.", link: "/fertilizer-guide", color: "bg-secondary" },
              { icon: CalendarDays, title: "Seasonal Tips", desc: "Month-by-month farming calendar for Kashmir climate.", link: "/seasonal-tips", color: "bg-primary" },
            ] as const).map((module, i) => (
              <motion.div key={module.title} custom={i + 1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to={module.link} className="group flex items-start gap-4 p-5 rounded-2xl border border-border bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                  <div className={`shrink-0 w-12 h-12 rounded-xl ${module.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <module.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground mb-1">{module.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{module.desc}</p>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-2 group-hover:gap-2 transition-all">
                      Explore <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 md:py-28 relative overflow-hidden" aria-label="Call to Action">
        {/* Vivid gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-[hsl(158,45%,18%)] to-[hsl(160,30%,10%)]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(28 75% 52% / 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 30%, hsl(142 50% 36% / 0.3) 0%, transparent 50%), radial-gradient(circle at 60% 80%, hsl(28 75% 52% / 0.3) 0%, transparent 40%)' }} />
        
        {/* Animated decorative elements */}
        <motion.div animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-10 right-[15%] w-20 h-20 rounded-full border-2 border-secondary/30" />
        <motion.div animate={{ y: [0, 10, 0], rotate: [0, -3, 0] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} className="absolute bottom-16 left-[10%] w-14 h-14 rounded-2xl bg-secondary/15 rotate-12" />
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-1/2 left-[5%] w-3 h-3 rounded-full bg-secondary/40" />
        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} className="absolute top-[30%] right-[8%] w-2 h-2 rounded-full bg-leaf/40" />

        <div className="container-custom relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center max-w-2xl mx-auto">
            <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-secondary/20 border border-secondary/30 rounded-full px-5 py-2 mb-6"
            >
              <Leaf className="h-4 w-4 text-secondary" />
              <span className="text-secondary text-sm font-semibold">Join 500+ Happy Farmers</span>
            </motion.div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground mb-5 leading-[1.15]">
              Ready to Transform{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-secondary">Your Yield</span>
                <motion.span initial={{ width: 0 }} whileInView={{ width: "100%" }} viewport={{ once: true }} transition={{ delay: 0.6, duration: 0.5 }}
                  className="absolute bottom-1 left-0 h-3 bg-secondary/20 rounded-full -z-0"
                />
              </span>
              ?
            </h2>

            <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 leading-relaxed">
              Premium products. Expert guidance. Doorstep delivery.<br className="hidden md:block" />
              Everything your farm needs — in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-base px-10 gap-2.5 h-14 rounded-2xl shadow-lg shadow-secondary/30 hover:shadow-xl hover:shadow-secondary/40 transition-all duration-300 hover:scale-105">
                  <ShoppingCart className="h-5 w-5" /> Shop Now
                </Button>
              </Link>
              <a href="https://wa.me/916006561732?text=Hi! I need help choosing products for my farm." target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 border-primary-foreground/30 text-primary-foreground bg-primary-foreground/5 hover:bg-primary-foreground/15 font-bold text-base px-10 h-14 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105">
                  💬 WhatsApp Us
                </Button>
              </a>
            </div>

            {/* Trust indicators */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-10 text-primary-foreground/50"
            >
              {["🛡️ Genuine Products", "🚚 Free Delivery*", "📞 24/7 Support"].map((item) => (
                <span key={item} className="text-xs md:text-sm font-medium">{item}</span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Store",
          name: "Mughal Grow Hub",
          description: "Premium pesticides, fertilizers, seeds & farming tools in Kashmir",
          address: { "@type": "PostalAddress", addressLocality: "Anantnag", addressRegion: "Jammu & Kashmir", addressCountry: "IN" },
          telephone: "+916006561732",
          priceRange: "₹",
          openingHours: "Mo-Sa 09:00-19:00",
        }),
      }} />
    </div>
  );
}

/* ===== Product Card Component ===== */
function ProductCard({ product, categoryImages, addItem, toast }: any) {
  return (
    <article className="bg-card border border-border rounded-2xl overflow-hidden group hover:shadow-lg hover:border-primary/20 transition-all duration-300">
      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.image_url || categoryImages[product.category] || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-4 md:p-5">
        <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">{categories.find(c => c.id === product.category)?.name}</span>
        <h3 className="font-display font-semibold text-foreground mt-1.5 mb-2 text-sm md:text-base line-clamp-1">{product.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 hidden md:block">{product.description}</p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg md:text-xl font-bold text-foreground font-display">₹{product.price}</span>
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${product.stock > 0 ? "text-leaf" : "text-destructive"}`}>
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>
        <Button
          size="sm"
          onClick={() => {
            addItem({ id: product.id, name: product.name, price: product.price, category: product.category, image_url: product.image_url || categoryImages[product.category], stock: product.stock });
            toast({ title: `${product.name} added to cart!` });
          }}
          disabled={product.stock <= 0}
          className="w-full bg-primary text-primary-foreground gap-1.5 h-9 text-xs rounded-xl"
        >
          <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
        </Button>
      </div>
    </article>
  );
}

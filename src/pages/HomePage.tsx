import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { ShieldCheck, Leaf, Award, Truck, Star, ArrowRight, Lightbulb, Users, TrendingUp, ShoppingCart, RefreshCw, Microscope, Bug, FlaskConical, CalendarDays, ScanLine } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { testimonials, categories, blogPosts } from "@/data/siteData";
import SEO from "@/components/SEO";
import heroBg from "@/assets/hero-bg.jpg";
import heroPoster from "@/assets/hero-poster.jpg";
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
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};


export default function HomePage() {
  const isMobile = useIsMobile();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const { addItem } = useCart();
  const { toast } = useToast();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, isMobile ? 0 : 200]);
  const heroScale = useTransform(scrollY, [0, 600], [1, isMobile ? 1 : 1.15]);

  // Video reliability: force play on visibility and handle buffering
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    if (isMobile) return;

    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      video.play().catch(() => setVideoFailed(true));
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          tryPlay();
        } else {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(video);

    const onVisibilityChange = () => {
      if (document.hidden) {
        video.pause();
      } else {
        tryPlay();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isMobile]);

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
        // Preload product images for instant rendering
        products.forEach((p) => {
          const src = p.image_url || categoryImages[p.category] || productPesticide;
          const img = new Image();
          img.src = src;
        });
      });
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Pull-to-refresh handlers
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
      {/* Pull-to-refresh indicator */}
      <div className="lg:hidden flex justify-center overflow-hidden transition-all duration-300" style={{ height: pullDistance }}>
        <RefreshCw className={`h-6 w-6 text-primary mt-2 transition-transform ${isRefreshing ? "animate-spin" : ""} ${pullDistance > 60 ? "text-secondary" : ""}`} style={{ transform: `rotate(${pullDistance * 3}deg)` }} />
      </div>
      <SEO
        title="Mughal Pesticides & Fertilizer – Trusted Partner for Healthy Crops in Kashmir"
        description="Premium pesticides, fertilizers, seeds & farming tools in Anantnag, Kashmir. Quality agricultural products for maximum crop yield. Order online with home delivery."
      />

      {/* Hero */}
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center overflow-hidden">
        {isMobile ? (
          <div className="absolute inset-0">
            <img src={heroBg} alt="Agricultural farmland in Kashmir valley" className="w-full h-full object-cover" loading="eager" fetchPriority="high" decoding="async" />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/65 to-foreground/30" />
          </div>
        ) : (
          <motion.div
            className="absolute inset-0"
            style={{ y: heroY, scale: heroScale }}
          >
            {!videoFailed ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={heroPoster}
                className="w-full h-full object-cover"
                onError={() => setVideoFailed(true)}
              >
                <source src="/hero-video.mp4" type="video/mp4" />
              </video>
            ) : (
              <img src={heroPoster} alt="Agricultural farmland in Kashmir valley" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/65 to-foreground/30 md:to-foreground/10" />
          </motion.div>
        )}
        <div className="container-custom relative z-10 py-24 md:py-32">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs md:text-sm font-semibold mb-4 md:mb-6">
              🌾 Premium Agricultural Solutions
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-background leading-tight mb-4 md:mb-6">
              Trusted Partner for <span className="text-secondary">Healthy Crops</span>
            </h1>
            <p className="text-base md:text-lg text-background/80 mb-6 md:mb-8 max-w-xl leading-relaxed">
              Your one-stop destination for premium pesticides, fertilizers, seeds, and farming tools in Kashmir. Quality products for maximum yield.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-gold-dark font-semibold text-base px-8 gap-2 h-12 md:h-auto">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="tel:+916006561732" className="sm:hidden">
                <Button size="lg" variant="outline" className="w-full border-primary-foreground text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 font-semibold text-base px-8 h-12 gap-2">
                  📞 Call Now
                </Button>
              </a>
              <Link to="/contact" className="hidden sm:block">
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 font-semibold text-base px-8">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>


      {/* Categories */}
      <section className="section-padding" aria-label="Product Categories">
        <div className="container-custom">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Our Product Categories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Browse our wide range of agricultural products designed for maximum crop health and yield.</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat, i) => (
              <motion.div key={cat.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to="/products" className="glass-card-hover rounded-xl overflow-hidden block group">
                  <div className="aspect-square overflow-hidden">
                    <img src={categoryImages[cat.id]} alt={`${cat.name} products`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" width={300} height={300} />
                  </div>
                  <div className="p-4 text-center">
                    <span className="text-2xl">{cat.icon}</span>
                    <h3 className="font-semibold text-foreground text-sm mt-1">{cat.name}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section-padding bg-accent/30" aria-label="Featured Products">
        <div className="container-custom">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Featured Products</h2>
            <p className="text-muted-foreground">Top-selling products trusted by farmers across Kashmir.</p>
          </motion.div>
          {/* Mobile: Swipeable Carousel */}
          <div className="lg:hidden">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-3">
                {featuredProducts.map((product) => (
                  <CarouselItem key={product.id} className="pl-3 basis-[75%] sm:basis-1/2">
                    <article className="glass-card-hover rounded-xl overflow-hidden group h-full">
                      <Link to={`/products/${product.id}`} className="block">
                        <div className="aspect-square overflow-hidden bg-muted">
                          <img src={product.image_url || categoryImages[product.category] || productPesticide} alt={product.name} className="w-full h-full object-cover" loading="lazy" width={400} height={400} />
                        </div>
                      </Link>
                      <div className="p-4">
                        <span className="text-xs font-medium text-primary bg-accent rounded-full px-2.5 py-0.5">{categories.find(c => c.id === product.category)?.name}</span>
                        <h3 className="font-semibold text-foreground mt-2 mb-1 text-sm line-clamp-1">{product.name}</h3>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-lg font-bold text-primary">₹{product.price}</span>
                          <span className={`text-xs ${product.stock > 0 ? "text-leaf" : "text-destructive"}`}>
                            {product.stock > 0 ? "In Stock" : "Out"}
                          </span>
                        </div>
                        <Button size="sm" onClick={() => { addItem({ id: product.id, name: product.name, price: product.price, category: product.category, image_url: product.image_url || categoryImages[product.category], stock: product.stock }); toast({ title: `${product.name} added!` }); }}
                          disabled={product.stock <= 0} className="w-full bg-primary text-primary-foreground gap-1.5 h-9 text-xs">
                          <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                        </Button>
                      </div>
                    </article>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <p className="text-center text-xs text-muted-foreground mt-3">← Swipe to see more →</p>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden lg:grid grid-cols-4 gap-6">
            {featuredProducts.map((product, i) => (
              <motion.div key={product.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <article className="glass-card-hover rounded-xl overflow-hidden group">
                  <Link to={`/products/${product.id}`} className="block">
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img src={product.image_url || categoryImages[product.category] || productPesticide} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={400} height={400} />
                    </div>
                  </Link>
                  <div className="p-5">
                    <span className="text-xs font-medium text-primary bg-accent rounded-full px-3 py-1">{categories.find(c => c.id === product.category)?.name}</span>
                    <h3 className="font-semibold text-foreground mt-3 mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">₹{product.price}</span>
                      <span className={`text-xs font-medium ${product.stock > 0 ? "text-leaf" : "text-destructive"}`}>
                        {product.stock > 0 ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                    <Button onClick={() => { addItem({ id: product.id, name: product.name, price: product.price, category: product.category, image_url: product.image_url || categoryImages[product.category], stock: product.stock }); toast({ title: `${product.name} added to cart!` }); }}
                      disabled={product.stock <= 0} className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                      <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </Button>
                  </div>
                </article>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/products">
              <Button variant="outline" size="lg" className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View All Products <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding" aria-label="Why Choose Us">
        <div className="container-custom">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Why Choose Us?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">We are committed to providing the best agricultural solutions for farmers.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: "Genuine Products", desc: "100% authentic products from trusted brands with quality assurance.", gradient: "from-emerald-500 to-green-600", shadow: "shadow-emerald-500/25", iconBg: "bg-emerald-500/20", badge: "✓ Certified" },
              { icon: Leaf, title: "Expert Guidance", desc: "Professional advice on crop protection and fertilizer usage.", gradient: "from-amber-500 to-yellow-600", shadow: "shadow-amber-500/25", iconBg: "bg-amber-500/20", badge: "🎓 Pro Advice" },
              { icon: Award, title: "Best Prices", desc: "Competitive pricing with seasonal discounts for farmers.", gradient: "from-blue-500 to-cyan-600", shadow: "shadow-blue-500/25", iconBg: "bg-blue-500/20", badge: "💰 Save More" },
              { icon: Truck, title: "Home Delivery", desc: "Convenient delivery service across Kashmir region.", gradient: "from-purple-500 to-pink-600", shadow: "shadow-purple-500/25", iconBg: "bg-purple-500/20", badge: "🚚 Fast" },
            ].map((item, i) => (
              <motion.div key={item.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="group relative rounded-2xl p-[2px] overflow-hidden"
              >
                {/* Animated gradient border */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <div className="relative bg-card rounded-2xl p-6 text-center h-full flex flex-col items-center">
                  {/* Badge */}
                  <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${item.gradient} text-white mb-4`}>
                    {item.badge}
                  </span>
                  
                  {/* Icon with glow */}
                  <div className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl ${item.iconBg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`h-8 w-8 bg-gradient-to-br ${item.gradient} bg-clip-text`} style={{ color: 'transparent', stroke: 'url(#grad)', filter: 'none' }} />
                    <item.icon className={`h-8 w-8 absolute`} style={{ color: item.gradient.includes('emerald') ? '#10b981' : item.gradient.includes('amber') ? '#f59e0b' : item.gradient.includes('blue') ? '#3b82f6' : '#a855f7' }} />
                  </div>
                  
                  <h3 className="font-bold text-foreground text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  
                  {/* Bottom accent line */}
                  <div className={`mt-4 h-1 w-12 rounded-full bg-gradient-to-r ${item.gradient} group-hover:w-20 transition-all duration-500`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Farmer Advisory Hub */}
      <section className="section-padding bg-accent/20" aria-label="Farmer Advisory Hub">
        <div className="container-custom">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3 tracking-wide uppercase">
              🧑‍🌾 Advisory Platform
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Farmer Resource Center</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Expert agricultural guidance tailored for Kashmir's climate, crops, and farming practices.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {([
              {
                icon: Microscope,
                title: "Crop Advisor",
                subtitle: "AI-Powered Guidance",
                desc: "Get personalized crop recommendations and best practices for Kashmir's climate.",
                features: ["Crop selection help", "Disease identification", "Yield optimization"],
                link: "/crop-advisor",
                cta: "Ask Crop Expert",
                gradient: "from-emerald-500 to-teal-600",
                glow: "group-hover:shadow-emerald-500/30",
                iconGradient: "from-emerald-400 to-teal-500",
                bgPattern: "radial-gradient(circle at 80% 20%, rgba(16,185,129,0.08) 0%, transparent 50%)",
              },
              {
                icon: ScanLine,
                title: "Disease Detector",
                subtitle: "AI Leaf Scanner",
                desc: "Upload a crop leaf photo and instantly detect diseases with AI-powered analysis.",
                features: ["Photo diagnosis", "Treatment plans", "Severity assessment"],
                link: "/disease-detector",
                cta: "Scan a Leaf",
                gradient: "from-orange-500 to-red-500",
                glow: "group-hover:shadow-orange-500/30",
                iconGradient: "from-orange-400 to-red-500",
                bgPattern: "radial-gradient(circle at 20% 80%, rgba(249,115,22,0.08) 0%, transparent 50%)",
              },
              {
                icon: Bug,
                title: "Pest Guide",
                subtitle: "Identification & Treatment",
                desc: "Identify common pests in Kashmir crops with treatment protocols and spray schedules.",
                features: ["Pest identification", "Spray schedules", "Organic options"],
                link: "/pest-guide",
                cta: "Identify Pests",
                gradient: "from-red-500 to-rose-600",
                glow: "group-hover:shadow-red-500/30",
                iconGradient: "from-red-400 to-rose-500",
                bgPattern: "radial-gradient(circle at 80% 80%, rgba(239,68,68,0.08) 0%, transparent 50%)",
              },
              {
                icon: FlaskConical,
                title: "Fertilizer Guide",
                subtitle: "Dosage & Application",
                desc: "Complete guide to Urea, DAP, NPK, Potash with correct dosage and timing.",
                features: ["NPK ratios", "Application methods", "Soil health"],
                link: "/fertilizer-guide",
                cta: "View Guide",
                gradient: "from-blue-500 to-indigo-600",
                glow: "group-hover:shadow-blue-500/30",
                iconGradient: "from-blue-400 to-indigo-500",
                bgPattern: "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.08) 0%, transparent 50%)",
              },
              {
                icon: CalendarDays,
                title: "Seasonal Tips",
                subtitle: "Kashmir Farming Calendar",
                desc: "Month-by-month guide from Spring (Sonth) to Winter (Wandh) with crop schedules.",
                features: ["Crop calendar", "Spray schedule", "Harvest timing"],
                link: "/seasonal-tips",
                cta: "View Calendar",
                gradient: "from-violet-500 to-purple-600",
                glow: "group-hover:shadow-violet-500/30",
                iconGradient: "from-violet-400 to-purple-500",
                bgPattern: "radial-gradient(circle at 50% 50%, rgba(139,92,246,0.08) 0%, transparent 50%)",
              },
            ] as const).map((module, i) => (
              <motion.div
                key={module.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <Link to={module.link} className="block h-full">
                  <div
                    className={`group relative h-full rounded-2xl border border-border/50 bg-card overflow-hidden transition-all duration-500 hover:shadow-2xl ${module.glow} hover:border-transparent`}
                    style={{ backgroundImage: module.bgPattern }}
                  >
                    {/* Top gradient bar */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${module.gradient}`} />

                    <div className="p-6 md:p-7">
                      {/* Icon */}
                      <div className={`relative inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${module.gradient} mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                        <module.icon className="h-7 w-7 text-white" />
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${module.gradient} opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500`} />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-foreground mb-1">{module.title}</h3>
                      <p className={`text-xs font-semibold bg-gradient-to-r ${module.gradient} bg-clip-text text-transparent mb-3`}>{module.subtitle}</p>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-5">{module.desc}</p>

                      {/* Feature pills */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {module.features.map(f => (
                          <span key={f} className="text-[11px] font-semibold bg-muted/60 text-foreground/70 border border-border/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                            {f}
                          </span>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className={`inline-flex items-center gap-2 text-sm font-bold bg-gradient-to-r ${module.gradient} bg-clip-text text-transparent group-hover:gap-3 transition-all duration-300`}>
                        {module.cta}
                        <ArrowRight className={`h-4 w-4 transition-transform duration-300 group-hover:translate-x-1`} style={{ color: module.gradient.includes('emerald') ? '#10b981' : module.gradient.includes('orange') ? '#f97316' : module.gradient.includes('red') ? '#ef4444' : module.gradient.includes('blue') ? '#3b82f6' : '#8b5cf6' }} />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section-padding bg-accent/30" aria-label="Subscribe">
        <div className="container-custom">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="glass-card rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto">
            <Lightbulb className="h-10 w-10 text-secondary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Stay Updated</h2>
            <p className="text-muted-foreground mb-6">Get the latest farming tips, product updates, and seasonal offers delivered to your phone.</p>
            <a href="https://wa.me/916006561732?text=Hi! I want to subscribe to your updates." target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold">
                Subscribe via WhatsApp <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Store",
            name: "Mughal Pesticides & Fertilizer",
            description: "Premium pesticides, fertilizers, seeds & farming tools in Kashmir",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Anantnag",
              addressRegion: "Jammu & Kashmir",
              addressCountry: "IN",
            },
            telephone: "+916006561732",
            priceRange: "₹",
            openingHours: "Mo-Sa 09:00-19:00",
          }),
        }}
      />
    </div>
  );
}

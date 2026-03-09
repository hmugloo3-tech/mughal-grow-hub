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

const stats = [
  { label: "Happy Farmers", value: "500+", icon: Users },
  { label: "Products Available", value: "200+", icon: TrendingUp },
  { label: "Years Experience", value: "10+", icon: Award },
  { label: "Brands Stocked", value: "50+", icon: Star },
];

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
              { icon: ShieldCheck, title: "Genuine Products", desc: "100% authentic products from trusted brands with quality assurance." },
              { icon: Leaf, title: "Expert Guidance", desc: "Professional advice on crop protection and fertilizer usage." },
              { icon: Award, title: "Best Prices", desc: "Competitive pricing with seasonal discounts for farmers." },
              { icon: Truck, title: "Home Delivery", desc: "Convenient delivery service across Kashmir region." },
            ].map((item, i) => (
              <motion.div key={item.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="glass-card-hover rounded-xl p-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-primary text-primary-foreground" aria-label="Customer Testimonials">
        <div className="container-custom">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">What Farmers Say</h2>
            <p className="text-primary-foreground/70">Trusted by hundreds of farmers across Kashmir.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/20">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-secondary text-secondary" />)}
                </div>
                <p className="text-primary-foreground/90 mb-4 text-sm leading-relaxed">"{t.text}"</p>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-primary-foreground/60">{t.role}</p>
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

          <div className="grid md:grid-cols-2 gap-5 mt-10">
            {([
              {
                icon: Microscope,
                title: "Crop Advisor",
                subtitle: "AI-Powered Guidance",
                desc: "Get personalized crop recommendations, disease diagnosis, and best practices based on Kashmir's soil and climate conditions.",
                features: ["Crop selection help", "Disease identification", "Yield optimization tips"],
                link: "/crop-advisor",
                cta: "Ask Crop Expert",
                accent: "from-primary/15 to-primary/5",
                iconBg: "bg-primary/15",
                iconColor: "text-primary",
              },
              {
                icon: ScanLine,
                title: "Disease Detector",
                subtitle: "AI Leaf Scanner",
                desc: "Upload a photo of any crop leaf and instantly detect diseases with AI. Get treatment advice, pesticide dosage, and organic alternatives.",
                features: ["Photo-based diagnosis", "Treatment plans", "Severity assessment"],
                link: "/disease-detector",
                cta: "Scan a Leaf",
                accent: "from-orange-500/15 to-orange-500/5",
                iconBg: "bg-orange-500/15",
                iconColor: "text-orange-500",
              },
              {
                icon: Bug,
                title: "Pest Guide",
                subtitle: "Identification & Treatment",
                desc: "Identify common pests and diseases in Kashmir crops with detailed treatment protocols and preventive spray schedules.",
                features: ["Visual pest identification", "Spray schedules", "Organic alternatives"],
                link: "/pest-guide",
                cta: "Identify Pests",
                accent: "from-destructive/10 to-destructive/5",
                iconBg: "bg-destructive/15",
                iconColor: "text-destructive",
              },
              {
                icon: FlaskConical,
                title: "Fertilizer Guide",
                subtitle: "Dosage & Application",
                desc: "Complete guide to using Urea, DAP, NPK, Potash, and organic fertilizers with correct dosage, timing, and precautions.",
                features: ["NPK ratios explained", "Application methods", "Soil health tips"],
                link: "/fertilizer-guide",
                cta: "View Guide",
                accent: "from-secondary/15 to-secondary/5",
                iconBg: "bg-secondary/15",
                iconColor: "text-secondary",
              },
              {
                icon: CalendarDays,
                title: "Seasonal Tips",
                subtitle: "Kashmir Farming Calendar",
                desc: "Month-by-month farming guide covering Spring (Sonth) to Winter (Wandh) with crop schedules, spray timing, and harvest planning.",
                features: ["Season-wise crop plan", "Spray & fertilizer schedule", "Harvest timing"],
                link: "/seasonal-tips",
                cta: "View Calendar",
                accent: "from-leaf/15 to-leaf/5",
                iconBg: "bg-leaf/15",
                iconColor: "text-leaf",
              },
            ] as const).map((module, i) => (
              <motion.div key={module.title} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to={module.link} className="block h-full">
                  <div className={`relative h-full rounded-2xl border border-border bg-gradient-to-br ${module.accent} p-6 md:p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group`}>
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${module.iconBg} flex items-center justify-center`}>
                        <module.icon className={`h-6 w-6 ${module.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{module.title}</h3>
                        <p className="text-xs font-medium text-muted-foreground">{module.subtitle}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">{module.desc}</p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {module.features.map(f => (
                        <span key={f} className="text-[11px] font-medium bg-background/80 text-foreground/70 border border-border px-2.5 py-1 rounded-full">{f}</span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                      {module.cta} <ArrowRight className="h-4 w-4" />
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

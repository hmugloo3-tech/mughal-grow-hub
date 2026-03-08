import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ShieldCheck, Leaf, Award, Truck, Star, ArrowRight, Lightbulb, Users, TrendingUp, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { testimonials, categories, blogPosts } from "@/data/siteData";
import heroBg from "@/assets/hero-bg.jpg";
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
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(4)
      .then(({ data }) => setFeaturedProducts(data || []));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="Agricultural farmland" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </div>
        <div className="container-custom relative z-10 py-32">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-semibold mb-6">
              🌾 Premium Agricultural Solutions
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-background leading-tight mb-6">
              Trusted Partner for{" "}
              <span className="text-secondary">Healthy Crops</span>
            </h1>
            <p className="text-lg text-background/80 mb-8 max-w-xl">
              Your one-stop destination for premium pesticides, fertilizers, seeds, and farming tools in Kashmir. Quality products for maximum yield.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-gold-dark font-semibold text-base px-8 gap-2">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 font-semibold text-base px-8">
                  Contact Us
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-16 z-20">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-card rounded-xl p-6 text-center"
              >
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding">
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
                    <img src={categoryImages[cat.id]} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
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
      <section className="section-padding bg-accent/30">
        <div className="container-custom">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Featured Products</h2>
            <p className="text-muted-foreground">Top-selling products trusted by farmers across Kashmir.</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, i) => (
              <motion.div key={product.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="glass-card-hover rounded-xl overflow-hidden group">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img src={product.image_url || categoryImages[product.category] || productPesticide} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
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
                    <Button
                      onClick={() => {
                        addItem({ id: product.id, name: product.name, price: product.price, category: product.category, image_url: product.image_url || categoryImages[product.category], stock: product.stock });
                        toast({ title: `${product.name} added to cart!` });
                      }}
                      disabled={product.stock <= 0}
                      className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </Button>
                  </div>
                </div>
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
      <section className="section-padding">
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
                className="glass-card-hover rounded-xl p-6 text-center"
              >
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
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-custom">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">What Farmers Say</h2>
            <p className="text-primary-foreground/70">Trusted by hundreds of farmers across Kashmir.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-6 border border-primary-foreground/20"
              >
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

      {/* Tips Preview */}
      <section className="section-padding">
        <div className="container-custom">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Agriculture Tips</h2>
            <p className="text-muted-foreground">Helpful knowledge for better farming practices.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {blogPosts.map((post, i) => (
              <motion.div key={post.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <Link to="/blog" className="glass-card-hover rounded-xl overflow-hidden block group">
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img src={categoryImages[post.category === "Pest Control" ? "pesticides" : post.category === "Fertilizers" ? "fertilizers" : post.category === "Crop Guide" ? "seeds" : "growth-promoters"]}
                      alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-medium text-secondary">{post.category}</span>
                    <h3 className="font-semibold text-foreground mt-1 mb-2 text-sm line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="section-padding bg-accent/30">
        <div className="container-custom">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
            className="glass-card rounded-2xl p-8 md:p-12 text-center max-w-2xl mx-auto"
          >
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
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
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

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { addItem } = useCart();
  const { toast } = useToast();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setProducts(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <section className="hero-gradient py-12 md:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">Our Products</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">Premium agricultural solutions for every farming need.</p>
        </div>
      </section>

      <div className="container-custom py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant={activeCategory === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveCategory("all")}
              className={activeCategory === "all" ? "bg-primary text-primary-foreground" : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"}>All</Button>
            {categories.map((cat) => (
              <Button key={cat.id} variant={activeCategory === cat.id ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat.id)}
                className={activeCategory === cat.id ? "bg-primary text-primary-foreground" : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"}>
                {cat.icon} {cat.name}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No products found. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <motion.div key={product.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="glass-card-hover rounded-xl overflow-hidden group h-full flex flex-col">
                  <div className="aspect-square overflow-hidden bg-muted">
                    <img src={product.image_url || fallbackImages[product.category] || productPesticide} alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span className="text-xs font-medium text-primary bg-accent rounded-full px-3 py-1 self-start">
                      {categories.find(c => c.id === product.category)?.name || product.category}
                    </span>
                    <h3 className="font-semibold text-foreground mt-3 mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">{product.description}</p>
                    {product.benefits && product.benefits.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.benefits.map((b) => (
                          <span key={b} className="text-[10px] bg-accent text-accent-foreground px-2 py-0.5 rounded-full">✓ {b}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold text-primary">₹{product.price}</span>
                      <span className={`text-xs font-medium ${product.stock > 0 ? "text-leaf" : "text-destructive"}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
                      </span>
                    </div>
                    <a href={`https://wa.me/916006561732?text=${encodeURIComponent(`Hi! I want to order: ${product.name} (₹${product.price})`)}`}
                      target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">Order via WhatsApp</Button>
                    </a>
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

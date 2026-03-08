import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Check, ChevronLeft, Star, ZoomIn, Package, Droplets, Info, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { categories } from "@/data/siteData";
import ProductReviews from "@/components/ProductReviews";
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

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from("products").select("*").eq("id", id).single();
      setProduct(data);

      if (data) {
        const { data: rel } = await supabase
          .from("products")
          .select("*")
          .eq("is_active", true)
          .eq("category", data.category)
          .neq("id", data.id)
          .limit(4);
        setRelated(rel || []);
      }
      setLoading(false);
    };
    load();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        image_url: product.image_url || fallbackImages[product.category],
        stock: product.stock,
      });
    }
    setAdded(true);
    toast({ title: `${product.name} added to cart!` });
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <Package className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold text-foreground">Product not found</h2>
        <Link to="/products">
          <Button variant="outline" className="gap-2 border-primary text-primary">
            <ChevronLeft className="h-4 w-4" /> Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  const productImage = product.image_url || fallbackImages[product.category] || productPesticide;
  const categoryName = categories.find((c) => c.id === product.category)?.name || product.category;

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      {/* Breadcrumb */}
      <div className="container-custom py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>
      </div>

      {/* Product Detail */}
      <div className="container-custom pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Section */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div
              className={`relative glass-card rounded-2xl overflow-hidden cursor-pointer group ${imageZoomed ? "fixed inset-0 z-50 rounded-none flex items-center justify-center bg-foreground/90" : "aspect-square"}`}
              onClick={() => setImageZoomed(!imageZoomed)}
            >
              <img
                src={productImage}
                alt={product.name}
                className={`${imageZoomed ? "max-h-[90vh] max-w-[90vw] object-contain" : "w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"}`}
              />
              {!imageZoomed && (
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 flex items-center justify-center">
                  <ZoomIn className="h-10 w-10 text-background opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              )}
              {imageZoomed && (
                <button
                  onClick={(e) => { e.stopPropagation(); setImageZoomed(false); }}
                  className="absolute top-4 right-4 bg-background text-foreground rounded-full p-2 hover:bg-accent"
                >✕</button>
              )}
            </div>
          </motion.div>

          {/* Info Section */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <span className="inline-block text-xs font-semibold text-primary bg-accent rounded-full px-4 py-1.5 mb-4">
              {categoryName}
            </span>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">{product.name}</h1>

            <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

            {/* Benefits */}
            {product.benefits && product.benefits.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-secondary" /> Key Benefits
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.benefits.map((b) => (
                    <span key={b} className="text-xs bg-accent text-accent-foreground px-3 py-1.5 rounded-full font-medium">
                      ✓ {b}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price & Stock */}
            <div className="glass-card rounded-xl p-5 mb-6">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Price</p>
                  <p className="text-3xl font-bold text-primary">₹{product.price}</p>
                </div>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${product.stock > 0 ? "bg-accent text-leaf" : "bg-destructive/10 text-destructive"}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
                </span>
              </div>

              {/* Quantity */}
              {product.stock > 0 && (
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-sm font-medium text-foreground">Qty:</span>
                  <div className="flex items-center rounded-lg border border-input overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 hover:bg-accent transition-colors text-foreground font-semibold"
                    >−</button>
                    <span className="px-4 py-1.5 text-sm font-semibold text-foreground bg-accent/50 min-w-[3rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1.5 hover:bg-accent transition-colors text-foreground font-semibold"
                    >+</button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12 text-base font-semibold"
                size="lg"
              >
                {added ? <><Check className="h-5 w-5" /> Added to Cart</> : <><ShoppingCart className="h-5 w-5" /> Add to Cart</>}
              </Button>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Droplets className="h-4 w-4 text-primary" />
                <span>Quality Assured</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4 text-primary" />
                <span>Secure Packaging</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Heart className="h-4 w-4 text-primary" />
                <span>Trusted by Farmers</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4 text-primary" />
                <span>Expert Support</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs: Usage Instructions & Reviews */}
        <div className="mt-12">
          <Tabs defaultValue="usage" className="w-full">
            <TabsList className="w-full justify-start bg-accent/50 rounded-xl p-1">
              <TabsTrigger value="usage" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">
                Usage Instructions
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm px-6">
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="usage">
              <div className="glass-card rounded-xl p-6 mt-4">
                {product.usage_instructions ? (
                  <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                    {product.usage_instructions.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Usage instructions will be provided with the product packaging. Contact us for detailed application guidance.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="glass-card rounded-xl p-6 mt-4">
                <ProductReviews productId={product.id} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Related Products</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((rp, i) => (
                <motion.div
                  key={rp.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  <Link to={`/products/${rp.id}`} className="glass-card-hover rounded-xl overflow-hidden block group">
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={rp.image_url || fallbackImages[rp.category] || productPesticide}
                        alt={rp.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">{rp.name}</h3>
                      <p className="text-lg font-bold text-primary">₹{rp.price}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

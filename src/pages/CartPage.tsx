import { Link } from "react-router-dom";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalItems, totalPrice } = useCart();

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <section className="hero-gradient py-12 md:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">Your Cart</h1>
          <p className="text-primary-foreground/80">{totalItems} item{totalItems !== 1 ? "s" : ""} in your cart</p>
        </div>
      </section>

      <div className="container-custom py-8">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/40 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Browse our products and add items to your cart.</p>
            <Link to="/products">
              <Button className="bg-primary text-primary-foreground gap-2">
                Browse Products <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="glass-card rounded-xl p-4 flex gap-4"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                      {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{item.category.replace("-", " ")}</p>
                      <p className="font-bold text-primary mt-1">₹{item.price}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <button onClick={() => removeItem(item.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <div className="flex items-center gap-2 bg-accent rounded-lg px-2 py-1">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-background rounded">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-background rounded"
                          disabled={item.quantity >= item.stock}>
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1">
              <div className="glass-card rounded-xl p-6 sticky top-24">
                <h3 className="font-semibold text-foreground text-lg mb-4">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-muted-foreground">
                      <span className="truncate mr-2">{item.name} × {item.quantity}</span>
                      <span className="shrink-0">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>₹{totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delivery</span>
                      <span className="text-xs">{totalPrice >= 1000 ? "FREE" : "Calculated at checkout"}</span>
                    </div>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground text-base">
                    <span>Total</span>
                    <span className="text-primary">₹{totalPrice}</span>
                  </div>
                </div>
                <Link to="/checkout">
                  <Button className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold" size="lg">
                    Proceed to Checkout <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/products" className="block text-center mt-3">
                  <Button variant="outline" size="sm" className="text-primary border-primary hover:bg-primary hover:text-primary-foreground w-full">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

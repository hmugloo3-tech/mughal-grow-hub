import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Package, MapPin, RefreshCw, LogOut, Clock, CheckCircle, Truck, ShoppingBag, Plus, Trash2, User,
  Heart, ShoppingCart, ChevronDown, ChevronUp, XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "orders" | "addresses" | "profile" | "wishlist";

interface Order {
  id: string;
  product_list: any;
  total_price: number;
  delivery_charges: number;
  status: string;
  payment_method: string;
  payment_status: string;
  estimated_delivery: string | null;
  tracking_notes: string[] | null;
  created_at: string;
  delivery_address_snapshot: any;
}

interface Address {
  id: string; label: string; full_name: string; phone: string;
  address_line1: string; address_line2: string | null; village: string | null;
  district: string; state: string; pincode: string; is_default: boolean;
}

const ORDER_STEPS = ["pending", "confirmed", "shipped", "delivered"];

const statusMeta: Record<string, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-secondary", label: "Order Placed" },
  confirmed: { icon: CheckCircle, color: "text-primary", label: "Confirmed" },
  shipped: { icon: Truck, color: "text-leaf", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "text-primary", label: "Delivered" },
  cancelled: { icon: XCircle, color: "text-destructive", label: "Cancelled" },
};

export default function CustomerDashboard() {
  const { user, loading, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("orders");

  if (loading) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" state={{ from: "/dashboard" }} replace />;

  return (
    <div className="min-h-screen pt-20 md:pt-24 bg-accent/20">
      <section className="hero-gradient py-8 md:py-12">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-foreground">My Dashboard</h1>
              <p className="text-primary-foreground/70 text-sm">{user.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut}
              className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        </div>
      </section>

      <div className="container-custom py-6">
        <div className="flex gap-2 mb-6 flex-wrap">
          {([
            { id: "orders" as Tab, label: "My Orders", icon: Package },
            { id: "wishlist" as Tab, label: "Wishlist", icon: Heart },
            { id: "addresses" as Tab, label: "Addresses", icon: MapPin },
            { id: "profile" as Tab, label: "Profile", icon: User },
          ]).map((t) => (
            <Button key={t.id} variant={tab === t.id ? "default" : "outline"} size="sm" onClick={() => setTab(t.id)}
              className={tab === t.id ? "bg-primary text-primary-foreground" : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"}>
              <t.icon className="h-4 w-4 mr-1" /> {t.label}
            </Button>
          ))}
        </div>

        {tab === "orders" && <OrdersTab userId={user.id} />}
        {tab === "wishlist" && <WishlistTab />}
        {tab === "addresses" && <AddressesTab userId={user.id} />}
        {tab === "profile" && <ProfileTab userId={user.id} email={user.email || ""} />}
      </div>
    </div>
  );
}

/* ─── ORDER TRACKING TIMELINE ─── */
function OrderTimeline({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 mt-3 p-3 bg-destructive/10 rounded-lg">
        <XCircle className="h-5 w-5 text-destructive" />
        <span className="text-sm font-semibold text-destructive">Order Cancelled</span>
      </div>
    );
  }

  const currentIdx = ORDER_STEPS.indexOf(status);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500"
          style={{ width: `${Math.max(0, (currentIdx / (ORDER_STEPS.length - 1)) * 100)}%` }}
        />

        {ORDER_STEPS.map((step, i) => {
          const meta = statusMeta[step];
          const Icon = meta.icon;
          const isCompleted = i <= currentIdx;
          const isCurrent = i === currentIdx;

          return (
            <div key={step} className="relative flex flex-col items-center z-10">
              <motion.div
                initial={false}
                animate={{ scale: isCurrent ? 1.15 : 1 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isCompleted
                    ? "bg-primary border-primary"
                    : "bg-background border-border"
                }`}
              >
                <Icon className={`h-4 w-4 ${isCompleted ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </motion.div>
              <span className={`text-[10px] mt-1.5 font-medium ${isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                {meta.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrdersTab({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false })
      .then(({ data }) => { setOrders((data || []) as Order[]); setLoading(false); });
  }, [userId]);

  const reorder = (order: Order) => {
    const items = order.product_list as any[];
    items.forEach((item: any) => {
      addItem({ id: item.id, name: item.name, price: item.price, category: "", image_url: null, stock: 999 });
    });
    toast({ title: "Items added to cart!", description: "Go to cart to complete your order." });
  };

  if (loading) return <div className="text-center py-10"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>;

  return (
    <div>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No orders yet.</p>
          <Link to="/products"><Button className="bg-primary text-primary-foreground">Browse Products</Button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const items = order.product_list as any[];
            const addr = order.delivery_address_snapshot as any;
            const isExpanded = expandedId === order.id;
            const meta = statusMeta[order.status] || statusMeta.pending;

            return (
              <motion.div key={order.id} layout className="glass-card rounded-xl overflow-hidden">
                {/* Header - always visible */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full p-5 text-left"
                >
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground font-mono">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-lg font-bold text-primary mt-1">₹{order.total_price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <meta.icon className={`h-4 w-4 ${meta.color}`} />
                        <span className={`text-sm font-semibold capitalize ${meta.color}`}>{order.status}</span>
                      </div>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Timeline */}
                  <OrderTimeline status={order.status} />
                </button>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-border pt-4">
                        <div className="space-y-1.5">
                          {items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                              <span className="text-foreground">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                          {order.delivery_charges > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Delivery</span>
                              <span className="text-foreground">₹{order.delivery_charges}</span>
                            </div>
                          )}
                        </div>

                        {addr && (
                          <div className="mt-3 text-xs text-muted-foreground">
                            <span className="font-medium">Delivery:</span> {addr.address_line1}, {addr.village || ""} {addr.district} - {addr.pincode}
                          </div>
                        )}

                        {order.estimated_delivery && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            <span className="font-medium">Est. Delivery:</span> {new Date(order.estimated_delivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </div>
                        )}

                        {order.tracking_notes && order.tracking_notes.length > 0 && (
                          <div className="mt-3 bg-accent rounded-lg p-3">
                            <p className="text-xs font-semibold text-foreground mb-1">Tracking Updates</p>
                            {order.tracking_notes.map((note, i) => (
                              <p key={i} className="text-xs text-muted-foreground">• {note}</p>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" onClick={() => reorder(order)}
                            className="gap-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                            <RefreshCw className="h-3 w-3" /> Reorder
                          </Button>
                          <span className="text-xs self-center text-muted-foreground capitalize">
                            Payment: {order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method} ({order.payment_status})
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── WISHLIST TAB ─── */
function WishlistTab() {
  const { wishlistIds, toggle } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const ids = Array.from(wishlistIds);
    if (ids.length === 0) { setProducts([]); setLoading(false); return; }
    supabase.from("products").select("*").in("id", ids)
      .then(({ data }) => { setProducts(data || []); setLoading(false); });
  }, [wishlistIds]);

  if (loading) return <div className="text-center py-10"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>;

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
        <Link to="/products"><Button className="bg-primary text-primary-foreground">Browse Products</Button></Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((p) => (
        <div key={p.id} className="glass-card rounded-xl overflow-hidden">
          <Link to={`/products/${p.id}`}>
            <div className="aspect-square overflow-hidden bg-muted">
              <img src={p.image_url || "/placeholder.svg"} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
          </Link>
          <div className="p-3">
            <h3 className="font-semibold text-sm text-foreground line-clamp-1">{p.name}</h3>
            <p className="text-lg font-bold text-primary">₹{p.price}</p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" className="flex-1 gap-1 bg-primary text-primary-foreground text-xs"
                onClick={() => { addItem({ id: p.id, name: p.name, price: p.price, category: p.category, image_url: p.image_url, stock: p.stock }); toast({ title: "Added to cart!" }); }}>
                <ShoppingCart className="h-3 w-3" /> Add
              </Button>
              <Button size="sm" variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => toggle(p.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AddressesTab({ userId }: { userId: string }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const { toast } = useToast();

  const load = () => {
    supabase.from("delivery_addresses").select("*").eq("user_id", userId).order("is_default", { ascending: false })
      .then(({ data }) => setAddresses((data || []) as Address[]));
  };
  useEffect(() => { load(); }, [userId]);

  const remove = async (id: string) => {
    await supabase.from("delivery_addresses").delete().eq("id", id);
    toast({ title: "Address deleted" });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">Saved Addresses</h2>
        <Link to="/checkout">
          <Button size="sm" className="gap-1 bg-primary text-primary-foreground"><Plus className="h-4 w-4" /> Add New</Button>
        </Link>
      </div>
      {addresses.length === 0 ? (
        <p className="text-muted-foreground text-center py-10">No saved addresses. Add one during checkout.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="glass-card rounded-xl p-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-primary bg-accent px-2 py-0.5 rounded-full">{addr.label}</span>
                <button onClick={() => remove(addr.id)} className="p-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="font-semibold text-foreground mt-2">{addr.full_name}</p>
              <p className="text-sm text-muted-foreground">{addr.phone}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {addr.address_line1}{addr.village ? `, ${addr.village}` : ""}, {addr.district} - {addr.pincode}
              </p>
              {addr.is_default && <span className="text-xs text-leaf font-medium mt-2 block">✓ Default</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileTab({ userId, email }: { userId: string; email: string }) {
  const [profile, setProfile] = useState<{ display_name: string | null; phone: string | null } | null>(null);

  useEffect(() => {
    supabase.from("profiles").select("display_name, phone").eq("user_id", userId).single()
      .then(({ data }) => setProfile(data));
  }, [userId]);

  return (
    <div className="glass-card rounded-xl p-6 max-w-md">
      <h2 className="text-lg font-semibold text-foreground mb-4">My Profile</h2>
      <div className="space-y-3 text-sm">
        <div><span className="text-muted-foreground">Name:</span> <span className="text-foreground font-medium">{profile?.display_name || "—"}</span></div>
        <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground font-medium">{email}</span></div>
        <div><span className="text-muted-foreground">Phone:</span> <span className="text-foreground font-medium">{profile?.phone || "—"}</span></div>
      </div>
    </div>
  );
}

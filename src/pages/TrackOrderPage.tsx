import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, Clock, CheckCircle, Truck, XCircle, MapPin, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const ORDER_STEPS = ["pending", "confirmed", "shipped", "delivered"];

const statusMeta: Record<string, { icon: typeof Clock; color: string; label: string; desc: string }> = {
  pending: { icon: Clock, color: "text-yellow-500", label: "Order Received", desc: "Your order has been received and is awaiting confirmation." },
  confirmed: { icon: CheckCircle, color: "text-blue-500", label: "Processing", desc: "Your order is confirmed and being prepared." },
  shipped: { icon: Truck, color: "text-primary", label: "Out for Delivery", desc: "Your order is on its way to you!" },
  delivered: { icon: CheckCircle, color: "text-primary", label: "Delivered", desc: "Your order has been delivered successfully." },
  cancelled: { icon: XCircle, color: "text-destructive", label: "Cancelled", desc: "This order has been cancelled." },
};

interface TrackedOrder {
  id: string;
  status: string;
  total_price: number;
  delivery_charges: number;
  payment_method: string;
  payment_status: string;
  estimated_delivery: string | null;
  tracking_notes: string[] | null;
  created_at: string;
  product_list: any;
  customer_name: string | null;
  delivery_address_snapshot: any;
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleTrack = async () => {
    if (!orderId.trim() || !phone.trim()) {
      setError("Please enter both Order ID and Phone Number.");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);
    setSearched(true);

    try {
      // Try to match the short ID (first 8 chars) or full UUID
      let fullId = orderId.trim();

      // If short ID provided, we need to find the full UUID first
      if (fullId.length < 36) {
        // Use the track_order function with a pattern match approach
        // We'll call rpc with a cleaned phone
        const cleanPhone = phone.trim().replace(/\s/g, "");
        
        // Query orders matching the short ID pattern
        const { data: orders } = await supabase
          .from("orders")
          .select("id")
          .eq("customer_phone", cleanPhone);

        if (orders) {
          const match = orders.find(o => o.id.slice(0, fullId.length).toUpperCase() === fullId.toUpperCase());
          if (match) fullId = match.id;
        }
      }

      const { data, error: rpcError } = await supabase.rpc("track_order", {
        _order_id: fullId,
        _phone: phone.trim().replace(/\s/g, ""),
      });

      if (rpcError || !data || (Array.isArray(data) && data.length === 0)) {
        setError("Order not found. Please check your Order ID and Phone Number.");
        setLoading(false);
        return;
      }

      const result = Array.isArray(data) ? data[0] : data;
      setOrder(result as TrackedOrder);
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  const currentIdx = order ? ORDER_STEPS.indexOf(order.status) : -1;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20">
      <SEO title="Track Your Order | Mughal Agri Store" description="Track your order status in real-time. Enter your Order ID and phone number to see delivery updates." />

      <section className="hero-gradient py-10 md:py-16">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-foreground/10 mb-4">
              <Package className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">Track Your Order</h1>
            <p className="text-primary-foreground/70 max-w-md mx-auto">Enter your Order ID and registered phone number to check your delivery status.</p>
          </motion.div>
        </div>
      </section>

      <div className="container-custom max-w-2xl -mt-8 relative z-10">
        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6 md:p-8 shadow-xl"
        >
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Order ID</label>
              <Input
                value={orderId}
                onChange={(e) => { setOrderId(e.target.value.toUpperCase()); setError(""); }}
                placeholder="e.g. A1B2C3D4"
                maxLength={36}
                className="font-mono"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Phone Number</label>
              <Input
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setError(""); }}
                placeholder="e.g. +916006561732"
                maxLength={15}
                type="tel"
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive mb-3">{error}</p>}
          <Button
            onClick={handleTrack}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground gap-2 font-semibold"
            size="lg"
          >
            {loading ? (
              <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {loading ? "Searching..." : "Track Order"}
          </Button>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {order && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.1 }}
              className="mt-8 space-y-6"
            >
              {/* Order Header */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex flex-wrap justify-between items-start gap-3 mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground font-mono">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-muted-foreground">
                      Placed on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(() => { const m = statusMeta[order.status] || statusMeta.pending; const Icon = m.icon; return <><Icon className={`h-5 w-5 ${m.color}`} /><span className={`font-semibold capitalize ${m.color}`}>{m.label}</span></>; })()}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {(statusMeta[order.status] || statusMeta.pending).desc}
                </p>
              </div>

              {/* Timeline */}
              {order.status !== "cancelled" ? (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-semibold text-foreground mb-6">Delivery Progress</h3>
                  <div className="relative">
                    {ORDER_STEPS.map((step, i) => {
                      const meta = statusMeta[step];
                      const Icon = meta.icon;
                      const isCompleted = i <= currentIdx;
                      const isCurrent = i === currentIdx;

                      return (
                        <div key={step} className="flex items-start gap-4 relative">
                          {/* Vertical line */}
                          {i < ORDER_STEPS.length - 1 && (
                            <div className={`absolute left-[19px] top-10 w-0.5 h-12 ${isCompleted && i < currentIdx ? "bg-primary" : "bg-border"}`} />
                          )}
                          <motion.div
                            initial={false}
                            animate={{ scale: isCurrent ? 1.15 : 1 }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shrink-0 transition-colors ${
                              isCompleted ? "bg-primary border-primary" : "bg-background border-border"
                            }`}
                          >
                            <Icon className={`h-5 w-5 ${isCompleted ? "text-primary-foreground" : "text-muted-foreground"}`} />
                          </motion.div>
                          <div className={`pb-12 ${i === ORDER_STEPS.length - 1 ? "pb-0" : ""}`}>
                            <p className={`font-semibold text-sm ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>{meta.label}</p>
                            <p className="text-xs text-muted-foreground">{meta.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-6 border-destructive/30 bg-destructive/5">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-8 w-8 text-destructive" />
                    <div>
                      <p className="font-semibold text-destructive">Order Cancelled</p>
                      <p className="text-sm text-muted-foreground">This order has been cancelled. Contact us for more details.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tracking Notes */}
              {order.tracking_notes && order.tracking_notes.length > 0 && (
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-semibold text-foreground mb-3">Updates</h3>
                  <div className="space-y-2">
                    {order.tracking_notes.map((note, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span className="text-muted-foreground">{note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Details */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Order Details</h3>
                <div className="space-y-2 text-sm">
                  {Array.isArray(order.product_list) && order.product_list.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between py-1.5 border-b border-border last:border-0">
                      <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                      <span className="font-medium text-foreground">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  {order.delivery_charges > 0 && (
                    <div className="flex justify-between py-1.5 border-b border-border">
                      <span className="text-muted-foreground">Delivery Charges</span>
                      <span className="text-foreground">₹{order.delivery_charges}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 font-bold text-base">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">₹{order.total_price}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block text-xs mb-0.5">Payment</span>
                    <span className="text-foreground capitalize">{order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method}</span>
                  </div>
                  {order.estimated_delivery && (
                    <div>
                      <span className="text-muted-foreground block text-xs mb-0.5">Est. Delivery</span>
                      <span className="text-foreground">{new Date(order.estimated_delivery).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                    </div>
                  )}
                </div>

                {order.delivery_address_snapshot && (
                  <div className="mt-4 pt-4 border-t border-border text-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span className="font-medium text-foreground text-xs">Delivery Address</span>
                    </div>
                    <p className="text-muted-foreground">
                      {order.delivery_address_snapshot.address_line1}
                      {order.delivery_address_snapshot.village ? `, ${order.delivery_address_snapshot.village}` : ""}
                      , {order.delivery_address_snapshot.district} - {order.delivery_address_snapshot.pincode}
                    </p>
                  </div>
                )}
              </div>

              <div className="text-center">
                <Link to="/products">
                  <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    Continue Shopping <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}

          {searched && !order && !loading && !error && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 text-center glass-card rounded-2xl p-8"
            >
              <Package className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">No order found with the provided details.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!id || !user) return;
    supabase.from("orders").select("*").eq("id", id).single().then(({ data }) => setOrder(data));
  }, [id, user]);

  return (
    <div className="min-h-screen pt-20 md:pt-24 flex items-center justify-center pb-20">
      <div className="container-custom max-w-lg text-center">
        <div className="glass-card rounded-2xl p-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <CheckCircle className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Order Placed Successfully! 🎉</h1>
          <p className="text-muted-foreground mb-4">Thank you for your order. We'll process it shortly.</p>

          {order && (
            <div className="bg-accent rounded-xl p-4 text-left mb-6 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="font-mono font-semibold text-foreground">{order.id.slice(0, 8).toUpperCase()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-bold text-primary">₹{order.total_price}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span className="text-foreground capitalize">{order.payment_method === "cod" ? "Cash on Delivery" : order.payment_method}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Est. Delivery</span><span className="text-foreground">{order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "TBD"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="font-medium text-secondary capitalize">{order.status}</span></div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link to="/dashboard">
              <Button className="w-full bg-primary text-primary-foreground gap-2">
                Track Your Order <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Home className="h-4 w-4" /> Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

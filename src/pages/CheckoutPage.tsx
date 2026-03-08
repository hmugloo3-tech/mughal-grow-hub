import { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MapPin, CreditCard, Truck, Plus, Check, ArrowRight, ArrowLeft, ShoppingBag, Tag } from "lucide-react";
import { Link } from "react-router-dom";

interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  village: string | null;
  district: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

interface DeliverySettings {
  base_charge: number;
  free_delivery_above: number;
  estimated_days_local: number;
  estimated_days_district: number;
}

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placing, setPlacing] = useState(false);
  const [settings, setSettings] = useState<DeliverySettings>({ base_charge: 50, free_delivery_above: 1000, estimated_days_local: 2, estimated_days_district: 4 });

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_type: string; discount_value: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [newAddr, setNewAddr] = useState({
    label: "Home", full_name: "", phone: "", address_line1: "", address_line2: "",
    village: "", district: "Anantnag", state: "Jammu & Kashmir", pincode: "", is_default: false,
  });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [{ data: addrs }, { data: settingsData }] = await Promise.all([
        supabase.from("delivery_addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }),
        supabase.from("delivery_settings").select("*").limit(1).single(),
      ]);
      if (addrs) { setAddresses(addrs as Address[]); if (addrs.length > 0) setSelectedAddressId(addrs[0].id); }
      if (settingsData) setSettings(settingsData as DeliverySettings);
    };
    load();
  }, [user]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center pt-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/auth" state={{ from: "/checkout" }} replace />;
  if (items.length === 0) return <Navigate to="/cart" replace />;

  const deliveryCharge = totalPrice >= settings.free_delivery_above ? 0 : settings.base_charge;
  const grandTotal = totalPrice + deliveryCharge;
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const saveAddress = async () => {
    if (!newAddr.full_name || !newAddr.phone || !newAddr.address_line1 || !newAddr.pincode) {
      toast({ title: "Please fill all required fields", variant: "destructive" }); return;
    }
    const { data, error } = await supabase.from("delivery_addresses").insert({
      ...newAddr, user_id: user.id,
    }).select().single();
    if (error) { toast({ title: "Error saving address", variant: "destructive" }); return; }
    setAddresses((prev) => [...prev, data as Address]);
    setSelectedAddressId(data.id);
    setShowAddressForm(false);
    setNewAddr({ label: "Home", full_name: "", phone: "", address_line1: "", address_line2: "", village: "", district: "Anantnag", state: "Jammu & Kashmir", pincode: "", is_default: false });
    toast({ title: "Address saved!" });
  };

  const placeOrder = async () => {
    if (!selectedAddress) { toast({ title: "Please select a delivery address", variant: "destructive" }); return; }
    setPlacing(true);

    const estDays = selectedAddress.district.toLowerCase() === "anantnag" ? settings.estimated_days_local : settings.estimated_days_district;
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + estDays);

    const orderData = {
      user_id: user.id,
      customer_name: selectedAddress.full_name,
      customer_phone: selectedAddress.phone,
      product_list: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })) as any,
      total_price: grandTotal,
      delivery_address_id: selectedAddress.id,
      delivery_address_snapshot: selectedAddress as any,
      delivery_charges: deliveryCharge,
      payment_method: paymentMethod,
      payment_status: "pending",
      estimated_delivery: estDate.toISOString().split("T")[0],
      status: "pending" as any,
    };
    const { data: order, error } = await supabase.from("orders").insert(orderData).select().single();

    if (error) {
      toast({ title: "Error placing order", description: error.message, variant: "destructive" });
      setPlacing(false); return;
    }

    // Send WhatsApp notification to shop owner
    const itemsList = items.map((i) => `${i.name} x${i.quantity} (₹${i.price * i.quantity})`).join("\n");
    const msg = `🛒 New Order!\n\nCustomer: ${selectedAddress.full_name}\nPhone: ${selectedAddress.phone}\nAddress: ${selectedAddress.address_line1}, ${selectedAddress.village || ""}, ${selectedAddress.district}\n\nItems:\n${itemsList}\n\nDelivery: ₹${deliveryCharge}\nTotal: ₹${grandTotal}\nPayment: ${paymentMethod.toUpperCase()}\n\nOrder ID: ${order.id.slice(0, 8)}`;
    window.open(`https://wa.me/916006561732?text=${encodeURIComponent(msg)}`, "_blank");

    clearCart();
    navigate(`/order-confirmation/${order.id}`);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <section className="hero-gradient py-8 md:py-12">
        <div className="container-custom text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-foreground">Checkout</h1>
        </div>
      </section>

      <div className="container-custom py-8">
        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[
            { n: 1, label: "Address", icon: MapPin },
            { n: 2, label: "Payment", icon: CreditCard },
            { n: 3, label: "Confirm", icon: Check },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center">
              <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                step >= s.n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                <s.icon className="h-4 w-4" /> {s.label}
              </div>
              {i < 2 && <div className={`w-8 h-0.5 mx-1 ${step > s.n ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Step 1: Address */}
            {step === 1 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Select Delivery Address</h2>
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`w-full text-left glass-card rounded-xl p-4 border-2 transition-all ${
                        selectedAddressId === addr.id ? "border-primary" : "border-transparent hover:border-primary/30"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-semibold text-primary bg-accent px-2 py-0.5 rounded-full">{addr.label}</span>
                          <p className="font-semibold text-foreground mt-2">{addr.full_name}</p>
                          <p className="text-sm text-muted-foreground">{addr.phone}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}
                            {addr.village ? `, ${addr.village}` : ""}, {addr.district}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          selectedAddressId === addr.id ? "border-primary bg-primary" : "border-muted-foreground"
                        }`}>
                          {selectedAddressId === addr.id && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                      </div>
                    </button>
                  ))}

                  {!showAddressForm ? (
                    <button onClick={() => setShowAddressForm(true)}
                      className="w-full glass-card rounded-xl p-4 border-2 border-dashed border-primary/30 hover:border-primary text-primary text-sm font-medium flex items-center justify-center gap-2">
                      <Plus className="h-4 w-4" /> Add New Address
                    </button>
                  ) : (
                    <div className="glass-card rounded-xl p-6">
                      <h3 className="font-semibold text-foreground mb-4">New Address</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium block mb-1">Label</label>
                          <select value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                            <option>Home</option><option>Shop</option><option>Farm</option><option>Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1">Full Name *</label>
                          <Input value={newAddr.full_name} onChange={(e) => setNewAddr({ ...newAddr, full_name: e.target.value })} maxLength={100} />
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1">Phone *</label>
                          <Input value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} placeholder="+91 XXXXXXXXXX" maxLength={15} />
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1">Village/Town</label>
                          <Input value={newAddr.village} onChange={(e) => setNewAddr({ ...newAddr, village: e.target.value })} maxLength={100} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium block mb-1">Address Line 1 *</label>
                          <Input value={newAddr.address_line1} onChange={(e) => setNewAddr({ ...newAddr, address_line1: e.target.value })} placeholder="House/Shop number, Street" maxLength={200} />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium block mb-1">Address Line 2</label>
                          <Input value={newAddr.address_line2} onChange={(e) => setNewAddr({ ...newAddr, address_line2: e.target.value })} placeholder="Landmark (optional)" maxLength={200} />
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1">District</label>
                          <Input value={newAddr.district} onChange={(e) => setNewAddr({ ...newAddr, district: e.target.value })} maxLength={100} />
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1">Pincode *</label>
                          <Input value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} maxLength={6} />
                        </div>
                      </div>
                      <div className="flex gap-3 mt-4 justify-end">
                        <Button variant="outline" onClick={() => setShowAddressForm(false)}>Cancel</Button>
                        <Button onClick={saveAddress} className="bg-primary text-primary-foreground">Save Address</Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={() => { if (!selectedAddressId) { toast({ title: "Select an address", variant: "destructive" }); return; } setStep(2); }}
                    className="bg-primary text-primary-foreground gap-2" size="lg">
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Select Payment Method</h2>
                <div className="space-y-3">
                  {[
                    { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive your order", icon: "💵" },
                    { id: "upi", label: "UPI Payment", desc: "Pay via UPI (PhonePe, GPay, Paytm)", icon: "📱" },
                    { id: "online", label: "Online Payment", desc: "Credit/Debit card or Net Banking", icon: "💳" },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`w-full text-left glass-card rounded-xl p-4 border-2 transition-all ${
                        paymentMethod === pm.id ? "border-primary" : "border-transparent hover:border-primary/30"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{pm.icon}</span>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{pm.label}</p>
                          <p className="text-sm text-muted-foreground">{pm.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === pm.id ? "border-primary bg-primary" : "border-muted-foreground"
                        }`}>
                          {paymentMethod === pm.id && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                      </div>
                    </button>
                  ))}

                  {(paymentMethod === "upi" || paymentMethod === "online") && (
                    <div className="glass-card rounded-xl p-4 bg-secondary/10 border border-secondary/30">
                      <p className="text-sm text-muted-foreground">
                        💡 {paymentMethod === "upi" ? "UPI payment details will be shared via WhatsApp after order placement." : "Online payment link will be shared via WhatsApp after order confirmation."}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <Button onClick={() => setStep(3)} className="bg-primary text-primary-foreground gap-2" size="lg">Review Order <ArrowRight className="h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div>
                <h2 className="text-lg font-semibold text-foreground mb-4">Review Your Order</h2>

                {selectedAddress && (
                  <div className="glass-card rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground text-sm">Delivery Address</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedAddress.full_name}, {selectedAddress.phone}<br />
                      {selectedAddress.address_line1}{selectedAddress.village ? `, ${selectedAddress.village}` : ""}<br />
                      {selectedAddress.district}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                  </div>
                )}

                <div className="glass-card rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground text-sm">Payment</span>
                  </div>
                  <p className="text-sm text-muted-foreground capitalize">{paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "upi" ? "UPI Payment" : "Online Payment"}</p>
                </div>

                <div className="glass-card rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingBag className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground text-sm">Items ({items.length})</span>
                  </div>
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm py-1.5 border-b border-border last:border-0">
                      <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                      <span className="font-medium text-foreground">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="glass-card rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground text-sm">Estimated Delivery</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedAddress?.district.toLowerCase() === "anantnag"
                      ? `Within ${settings.estimated_days_local} days (local delivery)`
                      : `Within ${settings.estimated_days_district} days`}
                  </p>
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setStep(2)} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
                  <Button onClick={placeOrder} disabled={placing} className="bg-secondary text-secondary-foreground hover:bg-gold-dark gap-2 font-semibold" size="lg">
                    {placing ? "Placing Order..." : "Place Order"} <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="glass-card rounded-xl p-6 sticky top-24">
              <h3 className="font-semibold text-foreground text-lg mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal ({items.length} items)</span><span>₹{totalPrice}</span></div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className={deliveryCharge === 0 ? "text-leaf font-medium" : ""}>
                    {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                  </span>
                </div>
                {deliveryCharge === 0 && totalPrice >= settings.free_delivery_above && (
                  <p className="text-xs text-leaf">🎉 Free delivery on orders above ₹{settings.free_delivery_above}!</p>
                )}
                <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground text-base">
                  <span>Total</span><span className="text-primary">₹{grandTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Package, ShoppingCart, FileText, BarChart3, LogOut, Plus, Pencil, Trash2, X, Save, Truck, MapPin, Upload, Image as ImageIcon, Users, AlertTriangle, TrendingUp, IndianRupee, Tag
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];
type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];

type Tab = "overview" | "products" | "orders" | "customers" | "blog" | "delivery";

export default function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-accent/20 pt-20">
      <div className="container-custom py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <Button variant="outline" size="sm" onClick={signOut} className="gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {([
            { id: "overview" as Tab, label: "Overview", icon: BarChart3 },
            { id: "products" as Tab, label: "Products", icon: Package },
            { id: "orders" as Tab, label: "Orders", icon: ShoppingCart },
            { id: "customers" as Tab, label: "Customers", icon: Users },
            { id: "delivery" as Tab, label: "Delivery", icon: Truck },
            { id: "blog" as Tab, label: "Blog", icon: FileText },
          ]).map((t) => (
            <Button key={t.id} variant={tab === t.id ? "default" : "outline"} size="sm" onClick={() => setTab(t.id)}
              className={tab === t.id ? "bg-primary text-primary-foreground" : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"}>
              <t.icon className="h-4 w-4 mr-1" /> {t.label}
            </Button>
          ))}
        </div>

        {tab === "overview" && <OverviewTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "customers" && <CustomersTab />}
        {tab === "delivery" && <DeliverySettingsTab />}
        {tab === "blog" && <BlogTab />}
      </div>
    </div>
  );
}

/* ─── OVERVIEW WITH ANALYTICS ─── */
const CHART_COLORS = ["hsl(122, 52%, 33%)", "hsl(43, 95%, 56%)", "hsl(100, 45%, 40%)", "hsl(0, 84%, 60%)", "hsl(200, 60%, 50%)"];

function OverviewTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [postCount, setPostCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [o, p, b, c] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("*"),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      setOrders(o.data || []);
      setProducts(p.data || []);
      setPostCount(b.count || 0);
      setCustomerCount(c.count || 0);
    };
    load();
  }, []);

  const totalRevenue = useMemo(() => orders.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total_price), 0), [orders]);
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const lowStockProducts = products.filter(p => p.stock <= 5 && p.is_active).length;

  // Revenue by day (last 7 days)
  const revenueByDay = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      days[key] = 0;
    }
    orders.filter(o => o.status !== "cancelled").forEach(o => {
      const d = new Date(o.created_at);
      const key = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      if (key in days) days[key] += Number(o.total_price);
    });
    return Object.entries(days).map(([name, revenue]) => ({ name, revenue }));
  }, [orders]);

  // Orders by status
  const ordersByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // Sales by category
  const salesByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    orders.filter(o => o.status !== "cancelled").forEach(o => {
      const items = o.product_list as any[];
      if (Array.isArray(items)) items.forEach((item: any) => {
        cats[item.category || "other"] = (cats[item.category || "other"] || 0) + (item.price * item.quantity);
      });
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-primary" },
          { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-secondary" },
          { label: "Pending Orders", value: pendingOrders, icon: AlertTriangle, color: pendingOrders > 0 ? "text-destructive" : "text-primary" },
          { label: "Products", value: products.length, icon: Package, color: "text-primary" },
          { label: "Customers", value: customerCount, icon: Users, color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="glass-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              {s.label === "Products" && lowStockProducts > 0 && (
                <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-semibold">{lowStockProducts} low stock</span>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Revenue (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="revenue" stroke="hsl(122, 52%, 33%)" strokeWidth={2} dot={{ fill: "hsl(122, 52%, 33%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Orders by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={ordersByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name} (${value})`}>
                {ordersByStatus.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sales by Category */}
      {salesByCategory.length > 0 && (
        <div className="glass-card rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Sales by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="value" fill="hsl(43, 95%, 56%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Inventory Alerts */}
      {lowStockProducts > 0 && (
        <div className="glass-card rounded-xl p-6 border-l-4 border-destructive">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Low Stock Alerts</h3>
          <div className="space-y-2">
            {products.filter(p => p.stock <= 5 && p.is_active).map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm py-1 border-b border-border last:border-0">
                <span className="text-foreground">{p.name}</span>
                <span className={`font-semibold ${p.stock === 0 ? "text-destructive" : "text-secondary"}`}>
                  {p.stock === 0 ? "Out of Stock" : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-3">Recent Orders</h3>
        <div className="space-y-2">
          {orders.slice(0, 5).map(o => (
            <div key={o.id} className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0">
              <div>
                <span className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</span>
                <span className="ml-2 text-foreground">{o.customer_name || "Guest"}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-primary">₹{o.total_price}</span>
                <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{o.status}</span>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No orders yet.</p>}
        </div>
      </div>
    </div>
  );
}

/* ─── CUSTOMERS TAB ─── */
function CustomersTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const load = async () => {
      const [p, o] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*"),
      ]);
      setCustomers(p.data || []);
      setOrders(o.data || []);
    };
    load();
  }, []);

  const getCustomerStats = (userId: string) => {
    const userOrders = orders.filter(o => o.user_id === userId);
    const totalSpent = userOrders.filter(o => o.status !== "cancelled").reduce((s, o) => s + Number(o.total_price), 0);
    return { orderCount: userOrders.length, totalSpent };
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Customers ({customers.length})</h2>
      {customers.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No customers registered yet.</p>
      ) : (
        <div className="space-y-3">
          {customers.map(c => {
            const stats = getCustomerStats(c.user_id);
            return (
              <div key={c.id} className="glass-card rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{c.display_name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{c.phone || "No phone"} · Joined {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">₹{stats.totalSpent.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">{stats.orderCount} order{stats.orderCount !== 1 ? "s" : ""}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── IMAGE UPLOAD (unchanged) ─── */
function ImageUpload({ currentUrl, onUpload }: { currentUrl?: string | null; onUpload: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast({ title: "Please select an image file", variant: "destructive" }); return; }
    if (file.size > 5 * 1024 * 1024) { toast({ title: "Image must be under 5MB", variant: "destructive" }); return; }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
    setPreview(publicUrl);
    onUpload(publicUrl);
    setUploading(false);
    toast({ title: "Image uploaded!" });
  };

  return (
    <div>
      <label className="text-sm font-medium block mb-1">Product Image</label>
      <div className="flex gap-3 items-start">
        <div onClick={() => fileRef.current?.click()}
          className="w-24 h-24 rounded-xl border-2 border-dashed border-input hover:border-primary cursor-pointer flex items-center justify-center bg-accent/50 overflow-hidden transition-colors">
          {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : uploading ? <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" /> : (
            <div className="text-center"><Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" /><span className="text-[10px] text-muted-foreground">Upload</span></div>
          )}
        </div>
        <div className="flex-1">
          <Input value={preview || ""} onChange={(e) => { setPreview(e.target.value); onUpload(e.target.value); }} placeholder="Or paste image URL..." className="text-sm" maxLength={500} />
          <p className="text-[10px] text-muted-foreground mt-1">Upload an image or paste a URL. Max 5MB.</p>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </div>
  );
}

/* ─── PRODUCTS TAB (unchanged) ─── */
function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.name || !editing?.category) { toast({ title: "Name and category required", variant: "destructive" }); return; }
    if (editing.id) {
      const { error } = await supabase.from("products").update({
        name: editing.name, category: editing.category, description: editing.description,
        price: editing.price || 0, stock: editing.stock || 0, image_url: editing.image_url,
        benefits: editing.benefits, usage_instructions: editing.usage_instructions, is_active: editing.is_active ?? true,
      }).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("products").insert({
        name: editing.name, category: editing.category, description: editing.description,
        price: editing.price || 0, stock: editing.stock || 0, image_url: editing.image_url,
        benefits: editing.benefits, usage_instructions: editing.usage_instructions,
      });
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: "Product saved!" });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    toast({ title: "Product deleted" });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">Manage Products ({products.length})</h2>
        <Button size="sm" onClick={() => setEditing({ name: "", category: "pesticides", price: 0, stock: 0, is_active: true })} className="gap-1 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {editing && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">{editing.id ? "Edit Product" : "New Product"}</h3>
            <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium block mb-1">Name *</label><Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} maxLength={200} /></div>
            <div><label className="text-sm font-medium block mb-1">Category *</label>
              <select value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="pesticides">Pesticides</option><option value="fertilizers">Fertilizers</option><option value="seeds">Seeds</option><option value="growth-promoters">Growth Promoters</option><option value="tools">Farming Tools</option>
              </select>
            </div>
            <div><label className="text-sm font-medium block mb-1">Price (₹)</label><Input type="number" value={editing.price || 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} min={0} /></div>
            <div><label className="text-sm font-medium block mb-1">Stock</label><Input type="number" value={editing.stock || 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} min={0} /></div>
            <div className="md:col-span-2"><label className="text-sm font-medium block mb-1">Description</label><Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} maxLength={2000} rows={3} /></div>
            <div className="md:col-span-2"><ImageUpload currentUrl={editing.image_url} onUpload={(url) => setEditing({ ...editing, image_url: url })} /></div>
            <div className="md:col-span-2"><label className="text-sm font-medium block mb-1">Benefits (comma-separated)</label>
              <Input value={(editing.benefits || []).join(", ")} onChange={(e) => setEditing({ ...editing, benefits: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} placeholder="e.g. Fast-acting, Long-lasting" maxLength={500} />
            </div>
            <div className="md:col-span-2"><label className="text-sm font-medium block mb-1">Usage Instructions</label><Textarea value={editing.usage_instructions || ""} onChange={(e) => setEditing({ ...editing, usage_instructions: e.target.value })} maxLength={2000} rows={2} /></div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /><span className="text-sm">Active (visible to customers)</span></label>
          </div>
          <div className="flex justify-end mt-4"><Button onClick={save} className="gap-1 bg-primary text-primary-foreground"><Save className="h-4 w-4" /> Save Product</Button></div>
        </div>
      )}

      <div className="space-y-3">
        {products.length === 0 && <p className="text-muted-foreground text-center py-8">No products yet. Add your first product above.</p>}
        {products.map((p) => (
          <div key={p.id} className="glass-card rounded-lg p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
              {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{p.name}</p>
              <p className="text-sm text-muted-foreground">{p.category} · ₹{p.price} · Stock: {p.stock} {p.stock <= 5 && p.stock > 0 && "⚠️"} {p.stock === 0 && "❌"} {!p.is_active && "· Inactive"}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setEditing(p)} className="p-2 rounded-lg hover:bg-accent"><Pencil className="h-4 w-4 text-primary" /></button>
              <button onClick={() => remove(p.id)} className="p-2 rounded-lg hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── ORDERS TAB (unchanged) ─── */
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [trackingInput, setTrackingInput] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status: status as any }).eq("id", id);
    toast({ title: `Order status updated to ${status}` });
    load();
  };

  const addTrackingNote = async (id: string) => {
    const note = trackingInput[id]?.trim();
    if (!note) return;
    const order = orders.find(o => o.id === id);
    const existing = (order?.tracking_notes || []) as string[];
    const timestamp = new Date().toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    await supabase.from("orders").update({ tracking_notes: [...existing, `[${timestamp}] ${note}`] }).eq("id", id);
    setTrackingInput(prev => ({ ...prev, [id]: "" }));
    toast({ title: "Tracking note added" });
    load();
  };

  const statusColors: Record<string, string> = {
    pending: "bg-secondary/20 text-secondary-foreground", confirmed: "bg-primary/20 text-primary",
    shipped: "bg-accent text-accent-foreground", delivered: "bg-primary/20 text-primary", cancelled: "bg-destructive/20 text-destructive",
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Customer Orders ({orders.length})</h2>
      {orders.length === 0 && <p className="text-muted-foreground text-center py-8">No orders yet.</p>}
      {orders.map((o) => {
        const items = o.product_list as any[];
        const addr = o.delivery_address_snapshot as any;
        return (
          <div key={o.id} className="glass-card rounded-xl p-5 mb-4">
            <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
              <div>
                <p className="text-xs font-mono text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</p>
                <p className="font-semibold text-foreground">{o.customer_name || "Guest"}</p>
                <p className="text-sm text-muted-foreground">{o.customer_phone || "N/A"}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary text-lg">₹{o.total_price}</p>
                <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                  className={`mt-1 text-xs rounded-full font-semibold px-3 py-1 border-0 ${statusColors[o.status] || ""}`}>
                  <option value="pending">⏳ Pending</option><option value="confirmed">✅ Confirmed</option><option value="shipped">🚚 Shipped</option><option value="delivered">📦 Delivered</option><option value="cancelled">❌ Cancelled</option>
                </select>
              </div>
            </div>
            <div className="border-t border-border pt-3 mb-3">
              {Array.isArray(items) && items.map((item: any, i: number) => (
                <div key={i} className="flex justify-between text-sm py-0.5">
                  <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                  <span className="text-foreground">₹{item.price * item.quantity}</span>
                </div>
              ))}
              {o.delivery_charges > 0 && <div className="flex justify-between text-sm py-0.5"><span className="text-muted-foreground">Delivery</span><span className="text-foreground">₹{o.delivery_charges}</span></div>}
            </div>
            {addr && (
              <div className="bg-accent rounded-lg p-3 mb-3 flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">{addr.full_name}, {addr.phone}<br />{addr.address_line1}{addr.village ? `, ${addr.village}` : ""}, {addr.district} - {addr.pincode}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
              <span>💳 {o.payment_method?.toUpperCase() || "COD"}</span>
              <span>💰 Payment: {o.payment_status || "pending"}</span>
              {o.estimated_delivery && <span>📅 Est: {new Date(o.estimated_delivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
            </div>
            {o.tracking_notes && (o.tracking_notes as string[]).length > 0 && (
              <div className="bg-accent rounded-lg p-3 mb-3">
                <p className="text-xs font-semibold text-foreground mb-1">Tracking Updates</p>
                {(o.tracking_notes as string[]).map((note, i) => <p key={i} className="text-xs text-muted-foreground">• {note}</p>)}
              </div>
            )}
            <div className="flex gap-2">
              <Input placeholder="Add tracking note..." value={trackingInput[o.id] || ""} onChange={(e) => setTrackingInput(prev => ({ ...prev, [o.id]: e.target.value }))} className="text-sm h-8" maxLength={200} />
              <Button size="sm" onClick={() => addTrackingNote(o.id)} className="bg-primary text-primary-foreground h-8 text-xs">Add</Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── DELIVERY SETTINGS (unchanged) ─── */
function DeliverySettingsTab() {
  const [settings, setSettings] = useState({ base_charge: 50, free_delivery_above: 1000, estimated_days_local: 2, estimated_days_district: 4, is_delivery_active: true, id: "" });
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("delivery_settings").select("*").limit(1).single().then(({ data }) => { if (data) setSettings(data as any); });
  }, []);

  const save = async () => {
    await supabase.from("delivery_settings").update({
      base_charge: settings.base_charge, free_delivery_above: settings.free_delivery_above,
      estimated_days_local: settings.estimated_days_local, estimated_days_district: settings.estimated_days_district, is_delivery_active: settings.is_delivery_active,
    }).eq("id", settings.id);
    toast({ title: "Delivery settings saved!" });
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-semibold text-foreground mb-4">Delivery Settings</h2>
      <div className="glass-card rounded-xl p-6 space-y-4">
        <div><label className="text-sm font-medium block mb-1">Base Delivery Charge (₹)</label><Input type="number" value={settings.base_charge} onChange={(e) => setSettings({ ...settings, base_charge: Number(e.target.value) })} min={0} /></div>
        <div><label className="text-sm font-medium block mb-1">Free Delivery Above (₹)</label><Input type="number" value={settings.free_delivery_above} onChange={(e) => setSettings({ ...settings, free_delivery_above: Number(e.target.value) })} min={0} /><p className="text-xs text-muted-foreground mt-1">Orders above this amount get free delivery</p></div>
        <div><label className="text-sm font-medium block mb-1">Est. Delivery Days (Local/Anantnag)</label><Input type="number" value={settings.estimated_days_local} onChange={(e) => setSettings({ ...settings, estimated_days_local: Number(e.target.value) })} min={1} /></div>
        <div><label className="text-sm font-medium block mb-1">Est. Delivery Days (Other Districts)</label><Input type="number" value={settings.estimated_days_district} onChange={(e) => setSettings({ ...settings, estimated_days_district: Number(e.target.value) })} min={1} /></div>
        <label className="flex items-center gap-2"><input type="checkbox" checked={settings.is_delivery_active} onChange={(e) => setSettings({ ...settings, is_delivery_active: e.target.checked })} /><span className="text-sm">Delivery service active</span></label>
        <Button onClick={save} className="w-full bg-primary text-primary-foreground gap-2"><Save className="h-4 w-4" /> Save Settings</Button>
      </div>
    </div>
  );
}

/* ─── BLOG TAB (unchanged) ─── */
function BlogTab() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<Partial<BlogPost> | null>(null);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    setPosts(data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.title) { toast({ title: "Title required", variant: "destructive" }); return; }
    if (editing.id) {
      await supabase.from("blog_posts").update({
        title: editing.title, content: editing.content, excerpt: editing.excerpt,
        category: editing.category, image_url: editing.image_url, is_published: editing.is_published ?? false,
      }).eq("id", editing.id);
    } else {
      await supabase.from("blog_posts").insert({
        title: editing.title, content: editing.content, excerpt: editing.excerpt,
        category: editing.category, image_url: editing.image_url, is_published: editing.is_published ?? false,
        author_id: user?.id,
      });
    }
    toast({ title: "Post saved!" });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("blog_posts").delete().eq("id", id);
    toast({ title: "Post deleted" });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground">Manage Blog</h2>
        <Button size="sm" onClick={() => setEditing({ title: "", is_published: false })} className="gap-1 bg-primary text-primary-foreground"><Plus className="h-4 w-4" /> New Post</Button>
      </div>
      {editing && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">{editing.id ? "Edit Post" : "New Post"}</h3>
            <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <div className="space-y-4">
            <div><label className="text-sm font-medium block mb-1">Title *</label><Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} maxLength={200} /></div>
            <div><label className="text-sm font-medium block mb-1">Category</label><Input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="e.g. Pest Control" maxLength={100} /></div>
            <div><label className="text-sm font-medium block mb-1">Excerpt</label><Textarea value={editing.excerpt || ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} maxLength={500} rows={2} /></div>
            <div><label className="text-sm font-medium block mb-1">Content</label><Textarea value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={6} /></div>
            <div><label className="text-sm font-medium block mb-1">Image URL</label><Input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} maxLength={500} /></div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_published || false} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} /><span className="text-sm">Published</span></label>
          </div>
          <div className="flex justify-end mt-4"><Button onClick={save} className="gap-1 bg-primary text-primary-foreground"><Save className="h-4 w-4" /> Save Post</Button></div>
        </div>
      )}
      <div className="space-y-3">
        {posts.length === 0 && <p className="text-muted-foreground text-center py-8">No blog posts yet.</p>}
        {posts.map((p) => (
          <div key={p.id} className="glass-card rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{p.title}</p>
              <p className="text-sm text-muted-foreground">{p.category} · {p.is_published ? "✅ Published" : "📝 Draft"}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(p)} className="p-2 rounded-lg hover:bg-accent"><Pencil className="h-4 w-4 text-primary" /></button>
              <button onClick={() => remove(p.id)} className="p-2 rounded-lg hover:bg-destructive/10"><Trash2 className="h-4 w-4 text-destructive" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

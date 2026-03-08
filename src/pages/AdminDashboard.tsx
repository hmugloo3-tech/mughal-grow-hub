import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Package, ShoppingCart, FileText, BarChart3, Plus, Pencil, Trash2, X, Save,
  Truck, MapPin, Upload, Image as ImageIcon, Users, AlertTriangle, TrendingUp,
  IndianRupee, Tag, Boxes, Eye, Search, ArrowUpDown, Check, MessageSquare, Mail, MailOpen, Star, ThumbsUp, ThumbsDown
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import type { Database } from "@/integrations/supabase/types";
import AdminLayout from "@/components/admin/AdminLayout";
import type { Tab } from "@/components/admin/AdminLayout";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];
type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending")
      .then(({ count }) => setPendingOrders(count || 0));
  }, [tab]);

  return (
    <AdminLayout activeTab={tab} onTabChange={setTab} pendingOrders={pendingOrders}>
      {tab === "overview" && <OverviewTab />}
      {tab === "products" && <ProductsTab />}
      {tab === "orders" && <OrdersTab />}
      {tab === "customers" && <CustomersTab />}
      {tab === "inventory" && <InventoryTab />}
      {tab === "coupons" && <CouponsTab />}
      {tab === "delivery" && <DeliverySettingsTab />}
      {tab === "blog" && <BlogTab />}
      {tab === "messages" && <MessagesTab />}
      {tab === "reviews" && <ReviewsTab />}
    </AdminLayout>
  );
}

/* ─── OVERVIEW ─── */
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

  const revenueByDay = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      days[key] = 0;
    }
    orders.filter(o => o.status !== "cancelled").forEach(o => {
      const key = new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      if (key in days) days[key] += Number(o.total_price);
    });
    return Object.entries(days).map(([name, revenue]) => ({ name, revenue }));
  }, [orders]);

  const ordersByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders]);

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
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-primary" },
          { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-secondary" },
          { label: "Pending", value: pendingOrders, icon: AlertTriangle, color: pendingOrders > 0 ? "text-destructive" : "text-primary" },
          { label: "Products", value: products.length, icon: Package, color: "text-primary" },
          { label: "Customers", value: customerCount, icon: Users, color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              {s.label === "Products" && lowStockProducts > 0 && (
                <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-semibold">{lowStockProducts} low</span>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Revenue (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueByDay}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(122, 52%, 33%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(122, 52%, 33%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(122, 52%, 33%)" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
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

      {salesByCategory.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Package className="h-4 w-4 text-primary" /> Sales by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={salesByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="value" fill="hsl(43, 95%, 56%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Low stock alerts */}
      {lowStockProducts > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Low Stock Alerts</h3>
          <div className="space-y-2">
            {products.filter(p => p.stock <= 5 && p.is_active).map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
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
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4">Recent Orders</h3>
        <div className="space-y-2">
          {orders.slice(0, 8).map(o => (
            <div key={o.id} className="flex items-center justify-between text-sm py-2.5 border-b border-border last:border-0">
              <div>
                <span className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</span>
                <span className="ml-2 text-foreground font-medium">{o.customer_name || "Guest"}</span>
                <span className="ml-2 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-primary">₹{o.total_price}</span>
                <span className={`text-xs capitalize px-2.5 py-1 rounded-full font-medium
                  ${o.status === "pending" ? "bg-secondary/20 text-secondary-foreground" : ""}
                  ${o.status === "confirmed" ? "bg-primary/15 text-primary" : ""}
                  ${o.status === "shipped" ? "bg-accent text-accent-foreground" : ""}
                  ${o.status === "delivered" ? "bg-primary/20 text-primary" : ""}
                  ${o.status === "cancelled" ? "bg-destructive/15 text-destructive" : ""}
                `}>{o.status}</span>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No orders yet.</p>}
        </div>
      </div>
    </div>
  );
}

/* ─── CUSTOMERS ─── */
function CustomersTab() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
    return { orderCount: userOrders.length, totalSpent, orders: userOrders };
  };

  const filtered = customers.filter(c =>
    !search || (c.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Customers ({customers.length})</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" maxLength={100} />
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No customers found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => {
            const stats = getCustomerStats(c.user_id);
            const expanded = expandedId === c.id;
            return (
              <div key={c.id} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setExpandedId(expanded ? null : c.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{c.display_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{c.phone || "No phone"} · Joined {new Date(c.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">₹{stats.totalSpent.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-muted-foreground">{stats.orderCount} orders</p>
                  </div>
                </button>
                {expanded && stats.orders.length > 0 && (
                  <div className="border-t border-border px-4 py-3 bg-accent/30 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Order History</p>
                    {stats.orders.slice(0, 10).map(o => (
                      <div key={o.id} className="flex items-center justify-between text-sm py-1">
                        <div>
                          <span className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8).toUpperCase()}</span>
                          <span className="ml-2 text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">₹{o.total_price}</span>
                          <span className="text-xs capitalize px-2 py-0.5 rounded-full bg-accent text-accent-foreground">{o.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── INVENTORY TAB ─── */
function InventoryTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<"stock" | "name">("stock");
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("products").select("*").order("stock", { ascending: true }).then(({ data }) => setProducts(data || []));
  }, []);

  const sorted = useMemo(() => {
    const arr = [...products];
    if (sortBy === "stock") arr.sort((a, b) => a.stock - b.stock);
    else arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [products, sortBy]);

  const updateStock = async (id: string) => {
    const newStock = editingStock[id];
    if (newStock === undefined) return;
    const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
    setEditingStock(prev => { const n = { ...prev }; delete n[id]; return n; });
    toast({ title: "Stock updated!" });
  };

  const outOfStock = products.filter(p => p.stock === 0 && p.is_active).length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5 && p.is_active).length;
  const healthyStock = products.filter(p => p.stock > 5 && p.is_active).length;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
          <p className="text-2xl font-bold text-destructive">{outOfStock}</p>
          <p className="text-xs text-muted-foreground">Out of Stock</p>
        </div>
        <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-4 text-center">
          <p className="text-2xl font-bold text-secondary">{lowStock}</p>
          <p className="text-xs text-muted-foreground">Low Stock (≤5)</p>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center">
          <p className="text-2xl font-bold text-primary">{healthyStock}</p>
          <p className="text-xs text-muted-foreground">Healthy</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">All Products</h2>
        <Button variant="outline" size="sm" onClick={() => setSortBy(sortBy === "stock" ? "name" : "stock")} className="gap-1 text-xs">
          <ArrowUpDown className="h-3 w-3" /> Sort by {sortBy === "stock" ? "Name" : "Stock"}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Stock</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Update</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div>
                      )}
                      <span className="font-medium text-foreground truncate max-w-[200px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{p.category}</td>
                  <td className="px-4 py-3 text-center">
                    {p.stock === 0 ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/15 text-destructive font-semibold">Out</span>
                    ) : p.stock <= 5 ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-semibold">Low</span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">OK</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number"
                      value={editingStock[p.id] !== undefined ? editingStock[p.id] : p.stock}
                      onChange={(e) => setEditingStock(prev => ({ ...prev, [p.id]: Number(e.target.value) }))}
                      className="w-20 h-8 text-center mx-auto text-sm"
                      min={0}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={editingStock[p.id] === undefined}
                      onClick={() => updateStock(p.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Check className="h-4 w-4 text-primary" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── IMAGE UPLOAD ─── */
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
          <p className="text-[10px] text-muted-foreground mt-1">Upload or paste URL. Max 5MB.</p>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </div>
  );
}

/* ─── PRODUCTS TAB ─── */
function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
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

  const categories = [...new Set(products.map(p => p.category))];
  const filtered = products.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filterCategory || p.category === filterCategory)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Products ({products.length})</h2>
        <Button size="sm" onClick={() => setEditing({ name: "", category: "pesticides", price: 0, stock: 0, is_active: true })} className="gap-1 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" maxLength={100} />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {editing && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-foreground">{editing.id ? "Edit Product" : "New Product"}</h3>
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
            <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="rounded" /><span className="text-sm">Active (visible to customers)</span></label>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} className="gap-1 bg-primary text-primary-foreground"><Save className="h-4 w-4" /> Save</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">No products found.</p>}
        {filtered.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
              {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground truncate">{p.name}</p>
                {!p.is_active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Inactive</span>}
              </div>
              <p className="text-sm text-muted-foreground capitalize">{p.category} · ₹{p.price} · Stock: {p.stock}
                {p.stock <= 5 && p.stock > 0 && " ⚠️"}
                {p.stock === 0 && " ❌"}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setEditing(p)} className="p-2 rounded-lg hover:bg-accent transition-colors"><Pencil className="h-4 w-4 text-primary" /></button>
              <button onClick={() => remove(p.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="h-4 w-4 text-destructive" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── ORDERS TAB ─── */
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [trackingInput, setTrackingInput] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
  };
  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status: status as any }).eq("id", id);
    toast({ title: `Order → ${status}` });
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

  const filtered = orders.filter(o =>
    (!filterStatus || o.status === filterStatus) &&
    (!search || (o.customer_name || "").toLowerCase().includes(search.toLowerCase()) || o.id.includes(search))
  );

  const statusColors: Record<string, string> = {
    pending: "bg-secondary/20 text-secondary-foreground",
    confirmed: "bg-primary/15 text-primary",
    shipped: "bg-accent text-accent-foreground",
    delivered: "bg-primary/20 text-primary",
    cancelled: "bg-destructive/15 text-destructive",
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Orders ({orders.length})</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or order ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" maxLength={100} />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">No orders found.</p>}
      {filtered.map((o) => {
        const items = o.product_list as any[];
        const addr = o.delivery_address_snapshot as any;
        return (
          <div key={o.id} className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow">
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
                  className={`mt-1 text-xs rounded-full font-semibold px-3 py-1 border-0 cursor-pointer ${statusColors[o.status] || ""}`}>
                  <option value="pending">⏳ Pending</option><option value="confirmed">✅ Confirmed</option>
                  <option value="shipped">🚚 Shipped</option><option value="delivered">📦 Delivered</option>
                  <option value="cancelled">❌ Cancelled</option>
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
              <div className="bg-accent/50 rounded-lg p-3 mb-3 flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">{addr.full_name}, {addr.phone}<br />{addr.address_line1}{addr.village ? `, ${addr.village}` : ""}, {addr.district} - {addr.pincode}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
              <span>💳 {o.payment_method?.toUpperCase() || "COD"}</span>
              <span>💰 {o.payment_status || "pending"}</span>
              {o.estimated_delivery && <span>📅 Est: {new Date(o.estimated_delivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
            </div>
            {o.tracking_notes && (o.tracking_notes as string[]).length > 0 && (
              <div className="bg-accent/50 rounded-lg p-3 mb-3">
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

/* ─── DELIVERY SETTINGS ─── */
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
    <div className="max-w-lg space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Delivery Settings</h2>
      <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
        <div><label className="text-sm font-medium block mb-1">Base Delivery Charge (₹)</label><Input type="number" value={settings.base_charge} onChange={(e) => setSettings({ ...settings, base_charge: Number(e.target.value) })} min={0} /></div>
        <div><label className="text-sm font-medium block mb-1">Free Delivery Above (₹)</label><Input type="number" value={settings.free_delivery_above} onChange={(e) => setSettings({ ...settings, free_delivery_above: Number(e.target.value) })} min={0} /></div>
        <div><label className="text-sm font-medium block mb-1">Est. Days (Local)</label><Input type="number" value={settings.estimated_days_local} onChange={(e) => setSettings({ ...settings, estimated_days_local: Number(e.target.value) })} min={1} /></div>
        <div><label className="text-sm font-medium block mb-1">Est. Days (Other Districts)</label><Input type="number" value={settings.estimated_days_district} onChange={(e) => setSettings({ ...settings, estimated_days_district: Number(e.target.value) })} min={1} /></div>
        <label className="flex items-center gap-2"><input type="checkbox" checked={settings.is_delivery_active} onChange={(e) => setSettings({ ...settings, is_delivery_active: e.target.checked })} className="rounded" /><span className="text-sm">Delivery service active</span></label>
        <Button onClick={save} className="w-full bg-primary text-primary-foreground gap-2"><Save className="h-4 w-4" /> Save Settings</Button>
      </div>
    </div>
  );
}

/* ─── BLOG TAB ─── */
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Blog ({posts.length})</h2>
        <Button size="sm" onClick={() => setEditing({ title: "", is_published: false })} className="gap-1 bg-primary text-primary-foreground"><Plus className="h-4 w-4" /> New Post</Button>
      </div>
      {editing && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-foreground">{editing.id ? "Edit Post" : "New Post"}</h3>
            <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <div className="space-y-4">
            <div><label className="text-sm font-medium block mb-1">Title *</label><Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} maxLength={200} /></div>
            <div><label className="text-sm font-medium block mb-1">Category</label><Input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="e.g. Pest Control" maxLength={100} /></div>
            <div><label className="text-sm font-medium block mb-1">Excerpt</label><Textarea value={editing.excerpt || ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} maxLength={500} rows={2} /></div>
            <div><label className="text-sm font-medium block mb-1">Content</label><Textarea value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={8} /></div>
            <div><ImageUpload currentUrl={editing.image_url} onUpload={(url) => setEditing({ ...editing, image_url: url })} /></div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_published || false} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} className="rounded" /><span className="text-sm">Published</span></label>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} className="gap-1 bg-primary text-primary-foreground"><Save className="h-4 w-4" /> Save</Button>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {posts.length === 0 && <p className="text-muted-foreground text-center py-8">No blog posts yet.</p>}
        {posts.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              {p.image_url && <img src={p.image_url} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />}
              <div>
                <p className="font-semibold text-foreground">{p.title}</p>
                <p className="text-sm text-muted-foreground">{p.category || "Uncategorized"} · {p.is_published ? "✅ Published" : "📝 Draft"} · {new Date(p.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setEditing(p)} className="p-2 rounded-lg hover:bg-accent transition-colors"><Pencil className="h-4 w-4 text-primary" /></button>
              <button onClick={() => remove(p.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="h-4 w-4 text-destructive" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── COUPONS TAB ─── */
function CouponsTab() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const { toast } = useToast();

  const load = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.code) { toast({ title: "Coupon code required", variant: "destructive" }); return; }
    const payload = {
      code: editing.code.toUpperCase().trim(),
      description: editing.description || null,
      discount_type: editing.discount_type || "percentage",
      discount_value: editing.discount_value || 0,
      min_order_amount: editing.min_order_amount || 0,
      max_uses: editing.max_uses || null,
      is_active: editing.is_active ?? true,
    };
    if (editing.id) {
      await supabase.from("coupons").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("coupons").insert(payload);
    }
    toast({ title: "Coupon saved!" });
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("coupons").delete().eq("id", id);
    toast({ title: "Coupon deleted" });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Coupons ({coupons.length})</h2>
        <Button size="sm" onClick={() => setEditing({ code: "", discount_type: "percentage", discount_value: 10, min_order_amount: 0, is_active: true })} className="gap-1 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> Add Coupon
        </Button>
      </div>

      {editing && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-foreground">{editing.id ? "Edit Coupon" : "New Coupon"}</h3>
            <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium block mb-1">Code *</label><Input value={editing.code || ""} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} placeholder="e.g. WELCOME10" maxLength={20} /></div>
            <div><label className="text-sm font-medium block mb-1">Discount Type</label>
              <select value={editing.discount_type || "percentage"} onChange={(e) => setEditing({ ...editing, discount_type: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="percentage">Percentage (%)</option><option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div><label className="text-sm font-medium block mb-1">Discount Value</label><Input type="number" value={editing.discount_value || 0} onChange={(e) => setEditing({ ...editing, discount_value: Number(e.target.value) })} min={0} /></div>
            <div><label className="text-sm font-medium block mb-1">Min Order (₹)</label><Input type="number" value={editing.min_order_amount || 0} onChange={(e) => setEditing({ ...editing, min_order_amount: Number(e.target.value) })} min={0} /></div>
            <div><label className="text-sm font-medium block mb-1">Max Uses (blank = unlimited)</label><Input type="number" value={editing.max_uses || ""} onChange={(e) => setEditing({ ...editing, max_uses: e.target.value ? Number(e.target.value) : null })} min={1} /></div>
            <div className="md:col-span-2"><label className="text-sm font-medium block mb-1">Description</label><Input value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} maxLength={200} /></div>
            <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} className="rounded" /><span className="text-sm">Active</span></label>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} className="gap-1 bg-primary text-primary-foreground"><Save className="h-4 w-4" /> Save</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {coupons.length === 0 && <p className="text-muted-foreground text-center py-8">No coupons yet.</p>}
        {coupons.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-primary">{c.code}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {c.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {c.discount_type === "percentage" ? `${c.discount_value}% off` : `₹${c.discount_value} off`}
                {c.min_order_amount > 0 ? ` · Min ₹${c.min_order_amount}` : ""}
                {c.max_uses ? ` · ${c.used_count}/${c.max_uses} used` : ` · ${c.used_count} used`}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setEditing(c)} className="p-2 rounded-lg hover:bg-accent transition-colors"><Pencil className="h-4 w-4 text-primary" /></button>
              <button onClick={() => remove(c.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"><Trash2 className="h-4 w-4 text-destructive" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── MESSAGES ─── */
function MessagesTab() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMessages(data || []);
        setLoading(false);
      });
  }, []);

  const toggleRead = async (id: string, current: boolean) => {
    await supabase.from("contact_submissions").update({ is_read: !current }).eq("id", id);
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: !current } : m)));
  };

  const remove = async (id: string) => {
    await supabase.from("contact_submissions").delete().eq("id", id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-primary" /> Contact Messages
        <span className="text-sm font-normal text-muted-foreground ml-2">
          {messages.filter((m) => !m.is_read).length} unread
        </span>
      </h2>

      {messages.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No messages yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`glass-card rounded-xl p-4 border-l-4 transition-colors ${
                msg.is_read ? "border-l-muted-foreground/20" : "border-l-primary"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground text-sm">{msg.name}</span>
                    {!msg.is_read && (
                      <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-semibold">NEW</span>
                    )}
                  </div>
                  {msg.email && <p className="text-xs text-muted-foreground">{msg.email}</p>}
                  {msg.phone && <p className="text-xs text-muted-foreground">{msg.phone}</p>}
                  <p className="text-sm text-foreground mt-2 leading-relaxed">{msg.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(msg.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => toggleRead(msg.id, msg.is_read)}
                    className="p-2 rounded-lg hover:bg-accent transition-colors"
                    title={msg.is_read ? "Mark as unread" : "Mark as read"}
                  >
                    {msg.is_read ? <Mail className="h-4 w-4 text-muted-foreground" /> : <MailOpen className="h-4 w-4 text-primary" />}
                  </button>
                  <button onClick={() => remove(msg.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── REVIEWS MODERATION ─── */
function ReviewsTab() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("product_reviews")
      .select("id, rating, review_text, is_approved, created_at, user_id, product_id")
      .order("created_at", { ascending: false });

    if (data) {
      // Enrich with product names and user names
      const productIds = [...new Set(data.map(r => r.product_id))];
      const userIds = [...new Set(data.map(r => r.user_id))];

      const [{ data: products }, { data: profiles }] = await Promise.all([
        supabase.from("products").select("id, name").in("id", productIds),
        supabase.from("profiles").select("user_id, display_name").in("user_id", userIds),
      ]);

      const productMap = new Map((products || []).map(p => [p.id, p.name]));
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p.display_name]));

      setReviews(data.map(r => ({
        ...r,
        product_name: productMap.get(r.product_id) || "Unknown",
        user_name: profileMap.get(r.user_id) || "Customer",
      })));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleApproval = async (id: string, current: boolean) => {
    await supabase.from("product_reviews").update({ is_approved: !current }).eq("id", id);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: !current } : r));
  };

  const remove = async (id: string) => {
    await supabase.from("product_reviews").delete().eq("id", id);
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Star className="h-5 w-5 text-primary" /> Review Moderation
        <span className="text-sm font-normal text-muted-foreground ml-2">{reviews.length} total</span>
      </h2>

      {reviews.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Star className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`glass-card rounded-xl p-4 border-l-4 ${
                review.is_approved ? "border-l-primary" : "border-l-secondary"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-foreground text-sm">{review.user_name}</span>
                    <span className="text-xs text-muted-foreground">on</span>
                    <span className="font-medium text-primary text-sm">{review.product_name}</span>
                    {!review.is_approved && (
                      <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full font-semibold">HIDDEN</span>
                    )}
                  </div>
                  <div className="flex gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? "text-secondary fill-secondary" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  {review.review_text && (
                    <p className="text-sm text-muted-foreground mt-1">{review.review_text}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => toggleApproval(review.id, review.is_approved)}
                    className="p-2 rounded-lg hover:bg-accent transition-colors"
                    title={review.is_approved ? "Hide review" : "Approve review"}
                  >
                    {review.is_approved
                      ? <ThumbsDown className="h-4 w-4 text-secondary" />
                      : <ThumbsUp className="h-4 w-4 text-primary" />
                    }
                  </button>
                  <button onClick={() => remove(review.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

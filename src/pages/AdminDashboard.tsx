import { useState, useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Package, ShoppingCart, FileText, BarChart3, LogOut, Plus, Pencil, Trash2, X, Save, Truck, MapPin, Upload, Image as ImageIcon
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];
type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];

type Tab = "overview" | "products" | "orders" | "blog" | "delivery";

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
            { id: "delivery" as Tab, label: "Delivery", icon: Truck },
            { id: "blog" as Tab, label: "Blog", icon: FileText },
          ]).map((t) => (
            <Button key={t.id} variant={tab === t.id ? "default" : "outline"} size="sm" onClick={() => setTab(t.id)}
              className={tab === t.id ? "bg-primary text-primary-foreground" : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"}
            >
              <t.icon className="h-4 w-4 mr-1" /> {t.label}
            </Button>
          ))}
        </div>

        {tab === "overview" && <OverviewTab />}
        {tab === "products" && <ProductsTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "delivery" && <DeliverySettingsTab />}
        {tab === "blog" && <BlogTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  const [counts, setCounts] = useState({ products: 0, orders: 0, posts: 0 });

  useEffect(() => {
    const load = async () => {
      const [p, o, b] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("blog_posts").select("id", { count: "exact", head: true }),
      ]);
      setCounts({ products: p.count || 0, orders: o.count || 0, posts: b.count || 0 });
    };
    load();
  }, []);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {[
        { label: "Products", count: counts.products, icon: Package, color: "text-primary" },
        { label: "Orders", count: counts.orders, icon: ShoppingCart, color: "text-secondary" },
        { label: "Blog Posts", count: counts.posts, icon: FileText, color: "text-leaf" },
      ].map((s) => (
        <div key={s.label} className="glass-card rounded-xl p-6 text-center">
          <s.icon className={`h-10 w-10 mx-auto mb-2 ${s.color}`} />
          <p className="text-3xl font-bold text-foreground">{s.count}</p>
          <p className="text-sm text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function ImageUpload({ currentUrl, onUpload }: { currentUrl?: string | null; onUpload: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from("product-images").upload(fileName, file);
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }

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
        <div
          onClick={() => fileRef.current?.click()}
          className="w-24 h-24 rounded-xl border-2 border-dashed border-input hover:border-primary cursor-pointer flex items-center justify-center bg-accent/50 overflow-hidden transition-colors"
        >
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          ) : uploading ? (
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          ) : (
            <div className="text-center">
              <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <span className="text-[10px] text-muted-foreground">Upload</span>
            </div>
          )}
        </div>
        <div className="flex-1">
          <Input
            value={preview || ""}
            onChange={(e) => { setPreview(e.target.value); onUpload(e.target.value); }}
            placeholder="Or paste image URL..."
            className="text-sm"
            maxLength={500}
          />
          <p className="text-[10px] text-muted-foreground mt-1">Upload an image or paste a URL. Max 5MB.</p>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </div>
  );
}

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
        <h2 className="text-lg font-semibold text-foreground">Manage Products</h2>
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
            <div>
              <label className="text-sm font-medium block mb-1">Name *</label>
              <Input value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} maxLength={200} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Category *</label>
              <select value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                <option value="pesticides">Pesticides</option>
                <option value="fertilizers">Fertilizers</option>
                <option value="seeds">Seeds</option>
                <option value="growth-promoters">Growth Promoters</option>
                <option value="tools">Farming Tools</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Price (₹)</label>
              <Input type="number" value={editing.price || 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} min={0} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Stock</label>
              <Input type="number" value={editing.stock || 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} min={0} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium block mb-1">Description</label>
              <Textarea value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} maxLength={2000} rows={3} />
            </div>
            <div className="md:col-span-2">
              <ImageUpload
                currentUrl={editing.image_url}
                onUpload={(url) => setEditing({ ...editing, image_url: url })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium block mb-1">Benefits (comma-separated)</label>
              <Input
                value={(editing.benefits || []).join(", ")}
                onChange={(e) => setEditing({ ...editing, benefits: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                placeholder="e.g. Fast-acting, Long-lasting, Rain-resistant"
                maxLength={500}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium block mb-1">Usage Instructions</label>
              <Textarea value={editing.usage_instructions || ""} onChange={(e) => setEditing({ ...editing, usage_instructions: e.target.value })} maxLength={2000} rows={2} />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={editing.is_active ?? true} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
              <span className="text-sm">Active (visible to customers)</span>
            </label>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={save} className="gap-1 bg-primary text-primary-foreground"><Save className="h-4 w-4" /> Save Product</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {products.length === 0 && <p className="text-muted-foreground text-center py-8">No products yet. Add your first product above.</p>}
        {products.map((p) => (
          <div key={p.id} className="glass-card rounded-lg p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-5 w-5 text-muted-foreground" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{p.name}</p>
              <p className="text-sm text-muted-foreground">{p.category} · ₹{p.price} · Stock: {p.stock} {!p.is_active && "· ⚠️ Inactive"}</p>
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
    const order = orders.find((o) => o.id === id);
    const existing = (order?.tracking_notes || []) as string[];
    const timestamp = new Date().toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    await supabase.from("orders").update({ tracking_notes: [...existing, `[${timestamp}] ${note}`] }).eq("id", id);
    setTrackingInput((prev) => ({ ...prev, [id]: "" }));
    toast({ title: "Tracking note added" });
    load();
  };

  const statusColors: Record<string, string> = {
    pending: "bg-secondary/20 text-secondary-foreground", confirmed: "bg-primary/20 text-primary",
    shipped: "bg-leaf/20 text-leaf", delivered: "bg-primary/20 text-primary", cancelled: "bg-destructive/20 text-destructive",
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
                  <option value="pending">⏳ Pending</option>
                  <option value="confirmed">✅ Confirmed</option>
                  <option value="shipped">🚚 Shipped</option>
                  <option value="delivered">📦 Delivered</option>
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
              {o.delivery_charges > 0 && (
                <div className="flex justify-between text-sm py-0.5">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-foreground">₹{o.delivery_charges}</span>
                </div>
              )}
            </div>

            {addr && (
              <div className="bg-accent rounded-lg p-3 mb-3 flex items-start gap-2">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {addr.full_name}, {addr.phone}<br />
                  {addr.address_line1}{addr.village ? `, ${addr.village}` : ""}, {addr.district} - {addr.pincode}
                </p>
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
                {(o.tracking_notes as string[]).map((note, i) => (
                  <p key={i} className="text-xs text-muted-foreground">• {note}</p>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Add tracking note..."
                value={trackingInput[o.id] || ""}
                onChange={(e) => setTrackingInput((prev) => ({ ...prev, [o.id]: e.target.value }))}
                className="text-sm h-8"
                maxLength={200}
              />
              <Button size="sm" onClick={() => addTrackingNote(o.id)} className="bg-primary text-primary-foreground h-8 text-xs">Add</Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DeliverySettingsTab() {
  const [settings, setSettings] = useState({ base_charge: 50, free_delivery_above: 1000, estimated_days_local: 2, estimated_days_district: 4, is_delivery_active: true, id: "" });
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("delivery_settings").select("*").limit(1).single().then(({ data }) => {
      if (data) setSettings(data as any);
    });
  }, []);

  const save = async () => {
    await supabase.from("delivery_settings").update({
      base_charge: settings.base_charge,
      free_delivery_above: settings.free_delivery_above,
      estimated_days_local: settings.estimated_days_local,
      estimated_days_district: settings.estimated_days_district,
      is_delivery_active: settings.is_delivery_active,
    }).eq("id", settings.id);
    toast({ title: "Delivery settings saved!" });
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-semibold text-foreground mb-4">Delivery Settings</h2>
      <div className="glass-card rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm font-medium block mb-1">Base Delivery Charge (₹)</label>
          <Input type="number" value={settings.base_charge} onChange={(e) => setSettings({ ...settings, base_charge: Number(e.target.value) })} min={0} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Free Delivery Above (₹)</label>
          <Input type="number" value={settings.free_delivery_above} onChange={(e) => setSettings({ ...settings, free_delivery_above: Number(e.target.value) })} min={0} />
          <p className="text-xs text-muted-foreground mt-1">Orders above this amount get free delivery</p>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Est. Delivery Days (Local/Anantnag)</label>
          <Input type="number" value={settings.estimated_days_local} onChange={(e) => setSettings({ ...settings, estimated_days_local: Number(e.target.value) })} min={1} />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Est. Delivery Days (Other Districts)</label>
          <Input type="number" value={settings.estimated_days_district} onChange={(e) => setSettings({ ...settings, estimated_days_district: Number(e.target.value) })} min={1} />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={settings.is_delivery_active} onChange={(e) => setSettings({ ...settings, is_delivery_active: e.target.checked })} />
          <span className="text-sm">Delivery service active</span>
        </label>
        <Button onClick={save} className="w-full bg-primary text-primary-foreground gap-2"><Save className="h-4 w-4" /> Save Settings</Button>
      </div>
    </div>
  );
}

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
        <Button size="sm" onClick={() => setEditing({ title: "", is_published: false })} className="gap-1 bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {editing && (
        <div className="glass-card rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">{editing.id ? "Edit Post" : "New Post"}</h3>
            <button onClick={() => setEditing(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Title *</label>
              <Input value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} maxLength={200} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Category</label>
              <Input value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="e.g. Pest Control" maxLength={100} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Excerpt</label>
              <Textarea value={editing.excerpt || ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} maxLength={500} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Content</label>
              <Textarea value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} rows={6} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Image URL</label>
              <Input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} maxLength={500} />
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={editing.is_published || false} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
              <span className="text-sm">Published</span>
            </label>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={save} className="gap-1 bg-primary text-primary-foreground"><Save className="h-4 w-4" /> Save Post</Button>
          </div>
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

import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Package, ShoppingCart, FileText, BarChart3, LogOut, Plus, Pencil, Trash2, X, Save
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Order = Database["public"]["Tables"]["orders"]["Row"];
type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];

type Tab = "overview" | "products" | "orders" | "blog";

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

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {([
            { id: "overview" as Tab, label: "Overview", icon: BarChart3 },
            { id: "products" as Tab, label: "Products", icon: Package },
            { id: "orders" as Tab, label: "Orders", icon: ShoppingCart },
            { id: "blog" as Tab, label: "Blog Posts", icon: FileText },
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
              <label className="text-sm font-medium block mb-1">Image URL</label>
              <Input value={editing.image_url || ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} placeholder="https://..." maxLength={500} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium block mb-1">Usage Instructions</label>
              <Textarea value={editing.usage_instructions || ""} onChange={(e) => setEditing({ ...editing, usage_instructions: e.target.value })} maxLength={2000} rows={2} />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={save} className="gap-1 bg-primary text-primary-foreground"><Save className="h-4 w-4" /> Save Product</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {products.length === 0 && <p className="text-muted-foreground text-center py-8">No products yet. Add your first product above.</p>}
        {products.map((p) => (
          <div key={p.id} className="glass-card rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{p.name}</p>
              <p className="text-sm text-muted-foreground">{p.category} · ₹{p.price} · Stock: {p.stock}</p>
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

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
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

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-4">Customer Orders</h2>
      {orders.length === 0 && <p className="text-muted-foreground text-center py-8">No orders yet.</p>}
      {orders.map((o) => (
        <div key={o.id} className="glass-card rounded-lg p-4 mb-3">
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div>
              <p className="font-semibold text-foreground">{o.customer_name}</p>
              <p className="text-sm text-muted-foreground">{o.customer_phone}</p>
              <p className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">₹{o.total_price}</p>
              <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)}
                className="mt-1 text-xs rounded border border-input bg-background px-2 py-1">
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          {o.notes && <p className="text-sm text-muted-foreground mt-2">Notes: {o.notes}</p>}
        </div>
      ))}
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

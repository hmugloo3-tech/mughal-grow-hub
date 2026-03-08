import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import {
  BarChart3, Package, ShoppingCart, Users, Tag, Truck, FileText,
  LogOut, Menu, X, ChevronLeft, Boxes, LayoutDashboard, Bell, MessageSquare, Star
} from "lucide-react";
import logo from "@/assets/logo.png";

type Tab = "overview" | "products" | "orders" | "customers" | "coupons" | "delivery" | "blog" | "inventory" | "messages";

const sidebarItems: { id: Tab; label: string; icon: any }[] = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "customers", label: "Customers", icon: Users },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "coupons", label: "Coupons", icon: Tag },
  { id: "delivery", label: "Delivery", icon: Truck },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

interface AdminLayoutProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  children: React.ReactNode;
  pendingOrders?: number;
}

export default function AdminLayout({ activeTab, onTabChange, children, pendingOrders = 0 }: AdminLayoutProps) {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col ${collapsed ? "w-[72px]" : "w-64"} transition-all duration-300 bg-sidebar border-r border-sidebar-border`}>
        {/* Logo */}
        <div className={`flex items-center ${collapsed ? "justify-center px-2" : "px-5"} h-16 border-b border-sidebar-border`}>
          <img src={logo} alt="Logo" className="h-9 w-9 shrink-0" />
          {!collapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-bold text-sidebar-foreground leading-tight truncate">Mughal Pesticides</p>
              <p className="text-[10px] text-sidebar-foreground/60 leading-tight">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative
                  ${isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {item.id === "orders" && pendingOrders > 0 && (
                  <span className={`${collapsed ? "absolute -top-1 -right-1" : "ml-auto"} bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center`}>
                    {pendingOrders}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className={`px-3 py-4 border-t border-sidebar-border space-y-2`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent transition-colors"
          >
            <ChevronLeft className={`h-4 w-4 shrink-0 transition-transform ${collapsed ? "rotate-180" : ""}`} />
            {!collapsed && <span>Collapse</span>}
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-sidebar border-r border-sidebar-border flex flex-col animate-in slide-in-from-left-full duration-300">
            <div className="flex items-center justify-between px-5 h-16 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Logo" className="h-9 w-9" />
                <div>
                  <p className="text-sm font-bold text-sidebar-foreground leading-tight">Mughal Pesticides</p>
                  <p className="text-[10px] text-sidebar-foreground/60 leading-tight">Admin Panel</p>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5 text-sidebar-foreground/60" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {sidebarItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onTabChange(item.id); setMobileOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                      ${isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                    {item.id === "orders" && pendingOrders > 0 && (
                      <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {pendingOrders}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
            <div className="px-3 py-4 border-t border-sidebar-border">
              <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-6 bg-card shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-accent" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground capitalize">
              {activeTab === "overview" ? "Dashboard" : activeTab}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {pendingOrders > 0 && (
              <button onClick={() => onTabChange("orders")} className="relative p-2 rounded-lg hover:bg-accent transition-colors">
                <Bell className="h-5 w-5 text-foreground" />
                <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{pendingOrders}</span>
              </button>
            )}
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export type { Tab };

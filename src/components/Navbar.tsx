import { useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart, Phone, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "Farmer Guide", path: "/farmer-guide", children: [
    { name: "🌿 Crop Advisor", path: "/crop-advisor" },
    { name: "🐛 Pest Guide", path: "/pest-guide" },
    { name: "🌱 Fertilizer Guide", path: "/fertilizer-guide" },
    { name: "📅 Seasonal Tips", path: "/seasonal-tips" },
    { name: "📰 Blog", path: "/blog" },
  ]},
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();
  const { user, isAdmin } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50">
      <div className="container-custom flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="Mughal Pesticides" className="h-11 w-11 md:h-13 md:w-13 rounded-lg object-contain bg-white p-0.5 shadow-sm" />
          <div className="hidden sm:block">
            <h1 className="text-sm md:text-base font-bold text-primary leading-tight">Mughal Pesticides</h1>
            <p className="text-[10px] md:text-xs text-muted-foreground leading-tight">& Fertilizer</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.path} className="relative group">
                <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                  link.children.some(c => location.pathname === c.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                }`}>
                  {link.name} <ChevronDown className="h-3 w-3" />
                </button>
                <div className="absolute top-full left-0 mt-1 w-48 rounded-xl glass-card border border-border/50 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  {link.children.map(child => (
                    <Link key={child.path} to={child.path}
                      className={`block px-4 py-2.5 text-sm font-medium transition-colors ${
                        location.pathname === child.path ? "text-primary bg-accent" : "text-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}>
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={link.path} to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                }`}>
                {link.name}
              </Link>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Cart */}
          <Link to="/cart" className="relative p-2 rounded-lg hover:bg-accent transition-colors">
            <ShoppingCart className="h-5 w-5 text-foreground" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>

          {/* User icon (logged in only) */}
          {user && (
            <Link to={isAdmin ? "/admin" : "/dashboard"} className="p-2 rounded-lg hover:bg-accent transition-colors">
              <User className="h-5 w-5 text-primary" />
            </Link>
          )}

          <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden glass-card border-t border-border/50"
          >
            <div className="container-custom py-4 flex flex-col gap-1">
              {navLinks.map((link) =>
                link.children ? (
                  <div key={link.path}>
                    <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{link.name}</p>
                    {link.children.map(child => (
                      <Link key={child.path} to={child.path} onClick={() => setOpen(false)}
                        className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all block ${
                          location.pathname === child.path ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
                        }`}>
                        {child.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link key={link.path} to={link.path} onClick={() => setOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      location.pathname === link.path ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
                    }`}>
                    {link.name}
                  </Link>
                )
              )}
              {!user && (
                <Link to="/auth" onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-accent">
                  Sign In / Sign Up
                </Link>
              )}
              {user && (
                <Link to={isAdmin ? "/admin" : "/dashboard"} onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium text-primary hover:bg-accent">
                  {isAdmin ? "Admin Dashboard" : "My Dashboard"}
                </Link>
              )}
              <a href="https://wa.me/916006561732" target="_blank" rel="noopener noreferrer" className="mt-2">
                <Button className="w-full gap-2 bg-primary text-primary-foreground">
                  <Phone className="h-4 w-4" /> WhatsApp Order
                </Button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

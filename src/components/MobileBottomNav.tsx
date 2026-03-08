import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, ShoppingCart, Phone, User } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: ShoppingBag, label: "Products", path: "/products" },
  { icon: ShoppingCart, label: "Cart", path: "/cart", showBadge: true },
  { icon: Phone, label: "WhatsApp", path: "https://wa.me/916006561732", external: true },
  { icon: User, label: "Account", path: "/auth", authPath: "/dashboard" },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user, isAdmin } = useAuth();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const isExternal = item.external;
          const resolvedPath = item.label === "Account"
            ? user ? (isAdmin ? "/admin" : (item.authPath || "/dashboard")) : item.path
            : item.path;
          const isActive = !isExternal && location.pathname === resolvedPath;

          const content = (
            <div className="flex flex-col items-center gap-0.5 relative min-w-[56px]">
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? "bg-primary/10" : ""}`}>
                <item.icon className={`h-5 w-5 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              {item.showBadge && totalItems > 0 && (
                <span className="absolute -top-0.5 right-1 w-4.5 h-4.5 min-w-[18px] bg-secondary text-secondary-foreground text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {totalItems}
                </span>
              )}
              <span className={`text-[10px] font-medium leading-none ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {item.label === "Account" && user ? (isAdmin ? "Admin" : "Account") : item.label}
              </span>
            </div>
          );

          if (isExternal) {
            return (
              <a key={item.label} href={item.path} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center active:scale-95 transition-transform">
                {content}
              </a>
            );
          }

          return (
            <Link key={item.label} to={resolvedPath}
              className="flex items-center justify-center active:scale-95 transition-transform">
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

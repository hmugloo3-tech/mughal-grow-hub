import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface WishlistContextType {
  wishlistIds: Set<string>;
  toggle: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { setWishlistIds(new Set()); return; }
    setLoading(true);
    supabase.from("wishlists").select("product_id").eq("user_id", user.id)
      .then(({ data }) => {
        setWishlistIds(new Set((data || []).map(d => d.product_id)));
        setLoading(false);
      });
  }, [user]);

  const toggle = useCallback(async (productId: string) => {
    if (!user) return;
    const exists = wishlistIds.has(productId);
    if (exists) {
      await supabase.from("wishlists").delete().eq("user_id", user.id).eq("product_id", productId);
      setWishlistIds(prev => { const n = new Set(prev); n.delete(productId); return n; });
    } else {
      await supabase.from("wishlists").insert({ user_id: user.id, product_id: productId });
      setWishlistIds(prev => new Set(prev).add(productId));
    }
  }, [user, wishlistIds]);

  const isInWishlist = useCallback((productId: string) => wishlistIds.has(productId), [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggle, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

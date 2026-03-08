import { useState, useEffect } from "react";
import { Star, Send, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  user_id: string;
  profiles?: { display_name: string | null } | null;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [userReview, setUserReview] = useState<Review | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("product_reviews")
      .select("id, rating, review_text, created_at, user_id")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (data) {
      // Fetch display names for reviewers
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);
      
      const enriched = data.map(r => ({
        ...r,
        profiles: { display_name: profileMap.get(r.user_id) || "Customer" }
      }));

      setReviews(enriched);
      if (user) {
        const mine = enriched.find(r => r.user_id === user.id);
        if (mine) {
          setUserReview(mine);
          setRating(mine.rating);
          setReviewText(mine.review_text || "");
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Please sign in to leave a review", variant: "destructive" });
      return;
    }
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      if (userReview) {
        const { error } = await supabase
          .from("product_reviews")
          .update({ rating, review_text: reviewText.trim() || null })
          .eq("id", userReview.id);
        if (error) throw error;
        toast({ title: "Review updated!" });
      } else {
        const { error } = await supabase
          .from("product_reviews")
          .insert({ product_id: productId, user_id: user.id, rating, review_text: reviewText.trim() || null });
        if (error) throw error;
        toast({ title: "Review submitted!" });
      }
      await fetchReviews();
    } catch {
      toast({ title: "Failed to submit review", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">{avgRating}</p>
            <div className="flex gap-0.5 justify-center my-1">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(Number(avgRating)) ? "text-secondary fill-secondary" : "text-muted-foreground/30"}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 space-y-1.5 w-full">
            {ratingCounts.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-8 text-right text-muted-foreground">{star}★</span>
                <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-muted-foreground text-xs">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write Review */}
      <div className="border border-border rounded-xl p-5 bg-accent/30">
        <h4 className="font-semibold text-foreground mb-3">
          {userReview ? "Update Your Review" : "Write a Review"}
        </h4>
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(s)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star className={`h-6 w-6 transition-colors ${s <= (hoverRating || rating) ? "text-secondary fill-secondary" : "text-muted-foreground/30"}`} />
            </button>
          ))}
          {rating > 0 && <span className="text-sm text-muted-foreground ml-2 self-center">{rating}/5</span>}
        </div>
        <Textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder={user ? "Share your experience with this product..." : "Sign in to write a review"}
          rows={3}
          maxLength={500}
          disabled={!user}
          className="mb-3"
        />
        <Button onClick={handleSubmit} disabled={submitting || !user || rating === 0} className="gap-2">
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="h-4 w-4" /> {userReview ? "Update Review" : "Submit Review"}</>}
        </Button>
        {!user && <p className="text-xs text-muted-foreground mt-2">Please sign in to leave a review.</p>}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <Star className="h-10 w-10 text-secondary mx-auto mb-3" />
          <p className="text-foreground font-semibold mb-1">No Reviews Yet</p>
          <p className="text-sm text-muted-foreground">Be the first to review this product!</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-border rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {review.profiles?.display_name || "Customer"}
                        {review.user_id === user?.id && <span className="text-xs text-primary ml-1">(You)</span>}
                      </p>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(review.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? "text-secondary fill-secondary" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                    {review.review_text && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{review.review_text}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import productPesticide from "@/assets/product-pesticide.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  category: string | null;
  created_at: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      setPosts(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <section className="hero-gradient py-12 md:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">Agriculture Tips & Blog</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">Expert farming advice and crop protection guides.</p>
        </div>
      </section>

      <div className="container-custom py-12">
        {loading ? (
          <div className="text-center py-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No blog posts yet. Check back soon for farming tips!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {posts.map((post, i) => (
              <motion.article key={post.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="glass-card-hover rounded-xl overflow-hidden"
              >
                <div className="aspect-video overflow-hidden bg-muted">
                  <img src={post.image_url || productPesticide} alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {post.category && <span className="text-xs font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full">{post.category}</span>}
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-foreground mb-2">{post.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
                  {post.content && (
                    <button className="text-sm font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                      Read More <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

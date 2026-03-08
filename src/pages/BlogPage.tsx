import { motion } from "framer-motion";
import { blogPosts } from "@/data/siteData";
import { Calendar, ArrowRight } from "lucide-react";
import productPesticide from "@/assets/product-pesticide.jpg";
import productFertilizer from "@/assets/product-fertilizer.jpg";
import productSeeds from "@/assets/product-seeds.jpg";
import productGrowth from "@/assets/product-growth.jpg";

const blogImages: Record<string, string> = {
  "Pest Control": productPesticide,
  "Fertilizers": productFertilizer,
  "Crop Guide": productSeeds,
  "Organic Farming": productGrowth,
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function BlogPage() {
  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <section className="hero-gradient py-12 md:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">Agriculture Tips & Blog</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">Expert farming advice and crop protection guides.</p>
        </div>
      </section>

      <div className="container-custom py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {blogPosts.map((post, i) => (
            <motion.article key={post.id} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="glass-card-hover rounded-xl overflow-hidden"
            >
              <div className="aspect-video overflow-hidden bg-muted">
                <img src={blogImages[post.category]} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-full">{post.category}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2">{post.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
                <button className="text-sm font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                  Read More <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}

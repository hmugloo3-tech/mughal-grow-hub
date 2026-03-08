import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Leaf, ArrowRight, Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

interface CropInfo {
  id: string;
  name: string;
  emoji: string;
  season: string;
  description: string;
  recommendedProducts: { name: string; type: string; reason: string }[];
  tips: string[];
}

const crops: CropInfo[] = [
  {
    id: "apple",
    name: "Apple",
    emoji: "🍎",
    season: "Spring – Autumn",
    description: "Kashmir's signature crop. Requires proper pest management and balanced nutrition for quality fruit.",
    recommendedProducts: [
      { name: "CropGuard Insecticide", type: "Pesticide", reason: "Controls codling moth and apple scab" },
      { name: "NPK 19-19-19", type: "Fertilizer", reason: "Balanced nutrition during fruiting stage" },
      { name: "GrowMax Plus", type: "Growth Promoter", reason: "Enhances flowering and fruit set" },
    ],
    tips: ["Prune trees in late winter before bud break", "Apply dormant spray before spring growth", "Thin fruits to 6-inch spacing for larger apples"],
  },
  {
    id: "rice",
    name: "Rice (Paddy)",
    emoji: "🌾",
    season: "May – October",
    description: "Staple crop of Kashmir valley. Grows well in waterlogged fields with proper fertilizer management.",
    recommendedProducts: [
      { name: "Urea Fertilizer", type: "Fertilizer", reason: "Essential nitrogen for vegetative growth" },
      { name: "DAP Fertilizer", type: "Fertilizer", reason: "Phosphorus for strong root development" },
      { name: "FungiShield Pro", type: "Pesticide", reason: "Prevents rice blast disease" },
    ],
    tips: ["Transplant seedlings at 25-30 days old", "Maintain 5cm water level during tillering", "Apply potash at flowering stage for grain filling"],
  },
  {
    id: "walnut",
    name: "Walnut",
    emoji: "🥜",
    season: "Year-round (harvest Sept–Oct)",
    description: "High-value tree crop native to Kashmir. Requires minimal intervention but benefits from proper nutrition.",
    recommendedProducts: [
      { name: "Organic Vermicompost", type: "Fertilizer", reason: "Improves soil health around root zone" },
      { name: "HumiGold", type: "Growth Promoter", reason: "Enhances nutrient uptake in trees" },
      { name: "CropGuard Insecticide", type: "Pesticide", reason: "Controls walnut blight and codling moth" },
    ],
    tips: ["Apply fertilizer in a ring around the drip line", "Prune dead wood in winter", "Harvest when green husk starts splitting"],
  },
  {
    id: "wheat",
    name: "Wheat",
    emoji: "🌿",
    season: "October – June",
    description: "Major rabi crop in Kashmir. Cold-tolerant varieties perform best in the region's climate.",
    recommendedProducts: [
      { name: "DAP Fertilizer", type: "Fertilizer", reason: "Basal dose for strong establishment" },
      { name: "Urea Fertilizer", type: "Fertilizer", reason: "Top dressing at tillering and jointing" },
      { name: "Premium Wheat Seeds", type: "Seeds", reason: "High-yielding variety adapted to Kashmir" },
    ],
    tips: ["Sow by mid-October for best yields", "First irrigation at crown root initiation (21 days)", "Apply weedicide within 30-35 days of sowing"],
  },
  {
    id: "saffron",
    name: "Saffron",
    emoji: "🌸",
    season: "August – November",
    description: "Kashmir's most prized spice crop. Requires well-drained karewa soil and careful post-harvest handling.",
    recommendedProducts: [
      { name: "Organic Vermicompost", type: "Fertilizer", reason: "Enriches soil without chemical damage" },
      { name: "Potash Fertilizer", type: "Fertilizer", reason: "Promotes corm development and flowering" },
      { name: "GrowMax Plus", type: "Growth Promoter", reason: "Stimulates flower bud initiation" },
    ],
    tips: ["Plant corms at 15cm depth in August", "Avoid waterlogging – saffron needs dry conditions", "Harvest flowers early morning before they open fully"],
  },
  {
    id: "vegetables",
    name: "Vegetables",
    emoji: "🥬",
    season: "Spring – Autumn",
    description: "Tomatoes, capsicum, beans, radish, and leafy greens thrive in Kashmir's temperate climate.",
    recommendedProducts: [
      { name: "NPK 19-19-19", type: "Fertilizer", reason: "Complete nutrition for vegetable crops" },
      { name: "Hybrid Tomato Seeds", type: "Seeds", reason: "Disease-resistant, high-yielding variety" },
      { name: "FungiShield Pro", type: "Pesticide", reason: "Prevents blight in tomatoes and capsicum" },
    ],
    tips: ["Start seedlings in protected nurseries in February", "Use mulch to retain moisture and suppress weeds", "Rotate crops every season to prevent disease buildup"],
  },
];

export default function CropAdvisorPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CropInfo | null>(null);

  const filtered = crops.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <section className="hero-gradient py-12 md:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">🌿 Crop-Based Product Recommendations</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">Select your crop to get personalized product suggestions for maximum yield.</p>
        </div>
      </section>

      <div className="container-custom py-12">
        <div className="max-w-md mx-auto mb-10 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search crops (e.g., Apple, Rice, Saffron)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {!selected ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {filtered.map((crop, i) => (
              <motion.button
                key={crop.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                onClick={() => setSelected(crop)}
                className="glass-card-hover rounded-xl p-6 text-center cursor-pointer"
              >
                <span className="text-4xl block mb-3">{crop.emoji}</span>
                <h3 className="font-semibold text-foreground text-sm">{crop.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{crop.season}</p>
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <button onClick={() => setSelected(null)} className="text-sm text-primary font-medium mb-6 flex items-center gap-1 hover:gap-2 transition-all">
              ← Back to all crops
            </button>

            <div className="glass-card rounded-2xl p-6 md:p-10 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">{selected.emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground">Season: {selected.season}</p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">{selected.description}</p>

              <h3 className="font-bold text-foreground text-lg mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" /> Recommended Products
              </h3>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {selected.recommendedProducts.map((p, i) => (
                  <div key={i} className="rounded-xl border border-border bg-accent/30 p-4">
                    <span className="text-xs font-semibold text-secondary">{p.type}</span>
                    <h4 className="font-semibold text-foreground mt-1">{p.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{p.reason}</p>
                  </div>
                ))}
              </div>

              <h3 className="font-bold text-foreground text-lg mb-4 flex items-center gap-2">
                <Leaf className="h-5 w-5 text-primary" /> Farming Tips
              </h3>
              <ul className="space-y-2">
                {selected.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-primary font-bold mt-0.5">✓</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center">
              <Link to="/products">
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  Browse All Products <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

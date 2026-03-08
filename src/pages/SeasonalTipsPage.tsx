import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sun, Snowflake, Leaf, Flower2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

interface Season {
  name: string;
  months: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  crops: string[];
  tips: { title: string; description: string }[];
  keyProducts: string[];
}

const seasons: Season[] = [
  {
    name: "Spring (Sonth)",
    months: "March – May",
    icon: Flower2,
    color: "text-primary",
    bgColor: "bg-accent",
    crops: ["Apple (flowering)", "Vegetables (transplanting)", "Rice nursery", "Maize sowing"],
    tips: [
      { title: "Prepare Nursery Beds", description: "Start tomato, capsicum, and brinjal seedlings in protected nurseries. Use treated seeds and sterilized soil media." },
      { title: "Apple Orchard Spraying", description: "Apply dormant oil spray before bud break. Follow up with fungicide at pink bud stage to prevent apple scab." },
      { title: "Soil Preparation", description: "Add vermicompost and well-rotted FYM to fields. Get soil tested and apply lime if pH is below 6.0." },
      { title: "Weed Management", description: "Apply pre-emergence herbicides in wheat fields. Manual weeding in vegetable plots before weeds set seed." },
      { title: "Irrigation Planning", description: "Check and repair irrigation channels. Set up drip irrigation for vegetable beds to conserve water." },
    ],
    keyProducts: ["FungiShield Pro", "NPK 19-19-19", "Hybrid Tomato Seeds", "Garden Sprayer"],
  },
  {
    name: "Summer (Grishm)",
    months: "June – August",
    icon: Sun,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    crops: ["Rice (transplanting)", "Vegetables (harvest)", "Apple (fruiting)", "Maize (growing)"],
    tips: [
      { title: "Rice Transplanting", description: "Transplant 25-30 day old seedlings at 20x15cm spacing. Apply DAP as basal dose before puddling." },
      { title: "Pest Monitoring", description: "Install pheromone traps in apple orchards. Scout rice fields weekly for stem borer and leaf folder." },
      { title: "Fertilizer Top-Dressing", description: "Apply second dose of urea to rice at tillering stage. Foliar spray NPK 19-19-19 on vegetable crops." },
      { title: "Fruit Thinning", description: "Thin apple fruits to one per cluster by mid-June for larger, better-quality harvest." },
      { title: "Disease Prevention", description: "Spray fungicides preventively in humid weather. Remove and destroy diseased plant parts immediately." },
    ],
    keyProducts: ["Urea Fertilizer", "DAP", "CropGuard Insecticide", "GrowMax Plus"],
  },
  {
    name: "Autumn (Harud)",
    months: "September – November",
    icon: Leaf,
    color: "text-secondary",
    bgColor: "bg-secondary/10",
    crops: ["Apple (harvest)", "Saffron", "Wheat (sowing)", "Rice (harvest)"],
    tips: [
      { title: "Apple Harvesting", description: "Harvest when fruit skin color changes and seeds turn brown. Handle carefully to avoid bruising. Store in cool, ventilated rooms." },
      { title: "Saffron Management", description: "Prepare saffron beds by September. Apply potash and organic manure. Harvest flowers early morning before petals open." },
      { title: "Wheat Sowing", description: "Sow wheat by mid-October. Treat seeds with fungicide. Apply DAP as basal dose at 100-125 kg/hectare." },
      { title: "Post-Harvest Soil Care", description: "Incorporate rice straw into soil instead of burning. Apply green manure crops to replenish organic matter." },
      { title: "Winter Crop Planning", description: "Plan rotations for rabi season. Order seeds and fertilizers early to avoid shortages." },
    ],
    keyProducts: ["Potash", "Premium Wheat Seeds", "Organic Vermicompost", "Pruning Shears"],
  },
  {
    name: "Winter (Wandh)",
    months: "December – February",
    icon: Snowflake,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    crops: ["Wheat (growing)", "Apple (dormant care)", "Protected cultivation"],
    tips: [
      { title: "Apple Tree Pruning", description: "Prune apple trees during dormancy. Remove dead, diseased, and crossing branches. Apply wound paste on large cuts." },
      { title: "Protected Farming", description: "Use polyhouses/greenhouses for off-season vegetable production. Grow lettuce, spinach, and herbs under protection." },
      { title: "Wheat Irrigation", description: "Give first irrigation at crown root initiation (21 days). Second irrigation at tillering stage (45-50 days)." },
      { title: "Soil Testing", description: "Ideal time to collect soil samples for testing. Plan fertilizer strategy for spring based on results." },
      { title: "Equipment Maintenance", description: "Service sprayers, clean storage tanks, sharpen tools. Prepare for busy spring season ahead." },
    ],
    keyProducts: ["Pruning Shears", "Urea Fertilizer", "HumiGold", "Garden Sprayer"],
  },
];

export default function SeasonalTipsPage() {
  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <section className="hero-gradient py-12 md:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">📅 Seasonal Crop Tips for Kashmir</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">Month-by-month farming guide tailored for Kashmir's unique climate and crops.</p>
        </div>
      </section>

      <div className="container-custom py-12 space-y-10">
        {seasons.map((season, i) => (
          <motion.div
            key={season.name}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="glass-card rounded-2xl overflow-hidden"
          >
            <div className={`${season.bgColor} px-6 py-5 flex items-center gap-4`}>
              <season.icon className={`h-8 w-8 ${season.color}`} />
              <div>
                <h2 className="text-xl font-bold text-foreground">{season.name}</h2>
                <p className="text-sm text-muted-foreground">{season.months}</p>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-2">Key Crops This Season</h3>
                <div className="flex flex-wrap gap-2">
                  {season.crops.map(c => (
                    <span key={c} className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-full">{c}</span>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {season.tips.map((tip, j) => (
                  <div key={j} className="border border-border rounded-xl p-4">
                    <h4 className="font-semibold text-foreground text-sm mb-1">{tip.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tip.description}</p>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Recommended Products</h3>
                <div className="flex flex-wrap gap-2">
                  {season.keyProducts.map(p => (
                    <Link key={p} to="/products" className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full hover:bg-primary/20 transition-colors">
                      {p}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        <div className="text-center pt-4">
          <Link to="/crop-advisor">
            <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Get Crop-Specific Advice <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

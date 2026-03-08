import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Droplets, Sprout, ArrowRight, FlaskConical, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

interface FertilizerInfo {
  name: string;
  emoji: string;
  npk: string;
  description: string;
  bestFor: string[];
  howToApply: string;
  dosage: string;
  timing: string;
  precautions: string[];
}

const fertilizers: FertilizerInfo[] = [
  {
    name: "Urea (46-0-0)",
    emoji: "⚪",
    npk: "46% Nitrogen",
    description: "The most widely used nitrogen fertilizer. Promotes lush vegetative growth, dark green foliage, and increased leaf area. Essential during the growth stage of all crops.",
    bestFor: ["Rice", "Wheat", "Maize", "Vegetables", "Apple (spring)"],
    howToApply: "Broadcast evenly or apply in bands near the root zone. Water immediately after application to minimize nitrogen loss through volatilization.",
    dosage: "50-100 kg/hectare depending on crop and soil test results",
    timing: "Split into 2-3 doses: basal, tillering/vegetative stage, and pre-flowering",
    precautions: ["Never apply on dry soil surface without watering", "Avoid during heavy rain to prevent leaching", "Do not mix with alkaline fertilizers like SSP", "Store in dry, cool place away from moisture"],
  },
  {
    name: "DAP (18-46-0)",
    emoji: "🟤",
    npk: "18% N, 46% P₂O₅",
    description: "Diammonium Phosphate is the most popular phosphatic fertilizer. Crucial for root development, flowering, and seed formation. Essential as basal dose at sowing time.",
    bestFor: ["All crops at sowing", "Rice transplanting", "Wheat basal dose", "Fruit trees", "Pulses"],
    howToApply: "Apply in furrows at sowing time or mix into soil before transplanting. Place 5-7cm below seed level for best results.",
    dosage: "100-150 kg/hectare as basal application",
    timing: "At sowing or transplanting time (one-time basal dose)",
    precautions: ["Do not surface broadcast – it becomes unavailable to plants", "Best applied in moist soil conditions", "Avoid direct contact with seeds as it may cause burning", "Complement with nitrogen top-dressing later"],
  },
  {
    name: "MOP / Potash (0-0-60)",
    emoji: "🔴",
    npk: "60% K₂O",
    description: "Muriate of Potash provides essential potassium for plant strength, disease resistance, water regulation, and quality improvement. Critical for fruit crops and tubers.",
    bestFor: ["Apple", "Saffron", "Potato", "Vegetables", "Rice"],
    howToApply: "Apply as basal dose mixed with soil, or split into basal + top dressing at flowering. Can be applied through fertigation in drip systems.",
    dosage: "40-80 kg/hectare based on soil potassium levels",
    timing: "50% at sowing/planting + 50% at flowering stage",
    precautions: ["Excessive application can cause salt damage in sandy soils", "Avoid chloride-sensitive crops (use SOP instead)", "Store away from moisture", "Soil test before applying to avoid over-dosing"],
  },
  {
    name: "NPK 19-19-19",
    emoji: "🟢",
    npk: "19% N, 19% P, 19% K",
    description: "Balanced water-soluble fertilizer containing equal parts of all three major nutrients. Ideal for foliar spray and fertigation to provide complete nutrition throughout growth.",
    bestFor: ["Vegetables", "Flowering plants", "Nursery crops", "Fruit trees (foliar)", "Greenhouse crops"],
    howToApply: "Dissolve 5g per litre of water for foliar spray. For fertigation, dissolve 3-5 kg per 1000L water. Spray in early morning or evening.",
    dosage: "5g/litre for foliar spray; 50g per plant for soil drench",
    timing: "Every 15-20 days during active growth period",
    precautions: ["Do not spray in hot afternoon sun", "Strain solution before spraying to avoid nozzle clogging", "Test on few plants first if using with pesticides", "Not a substitute for basal fertilizer application"],
  },
  {
    name: "Organic Vermicompost",
    emoji: "🪱",
    npk: "~1.5% N, 1% P, 1.5% K + micronutrients",
    description: "100% organic fertilizer produced by earthworm digestion. Enriched with beneficial microorganisms, humic acids, and growth hormones. Improves soil structure, water-holding capacity, and long-term fertility.",
    bestFor: ["Saffron", "All vegetables", "Kitchen gardens", "Fruit tree basins", "Organic farming"],
    howToApply: "Mix 500g–1kg per plant in the root zone. For field crops, broadcast 2-5 tonnes/hectare and incorporate into soil before sowing.",
    dosage: "2-5 tonnes/hectare or 500g per plant",
    timing: "Apply 2-3 weeks before sowing or during soil preparation",
    precautions: ["Ensure vermicompost is fully matured (dark, crumbly, earthy smell)", "Avoid applying in waterlogged conditions", "Can be combined with chemical fertilizers for better results", "Store in shade to preserve beneficial microorganisms"],
  },
];

export default function FertilizerGuidePage() {
  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <section className="hero-gradient py-12 md:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">🌱 Fertilizer Usage Guide</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">Complete guide to choosing and using the right fertilizer for your crops.</p>
        </div>
      </section>

      <div className="container-custom py-12 space-y-8">
        {fertilizers.map((fert, i) => (
          <motion.div
            key={fert.name}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="glass-card rounded-2xl p-6 md:p-8"
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-4xl">{fert.emoji}</span>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">{fert.name}</h2>
                <span className="text-sm font-medium text-primary">{fert.npk}</span>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">{fert.description}</p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                    <Sprout className="h-4 w-4 text-primary" /> Best For
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {fert.bestFor.map(crop => (
                      <span key={crop} className="text-xs bg-accent text-accent-foreground px-3 py-1 rounded-full">{crop}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                    <Droplets className="h-4 w-4 text-primary" /> How to Apply
                  </h4>
                  <p className="text-sm text-muted-foreground">{fert.howToApply}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                    <FlaskConical className="h-4 w-4 text-primary" /> Dosage
                  </h4>
                  <p className="text-sm text-muted-foreground">{fert.dosage}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-primary" /> Best Timing
                  </h4>
                  <p className="text-sm text-muted-foreground">{fert.timing}</p>
                </div>
              </div>
            </div>

            <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
              <h4 className="font-semibold text-foreground mb-2 text-sm">⚠️ Precautions</h4>
              <ul className="grid sm:grid-cols-2 gap-1">
                {fert.precautions.map((p, j) => (
                  <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span> {p}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}

        <div className="text-center pt-4">
          <Link to="/products">
            <Button size="lg" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              Shop Fertilizers <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Bug, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

interface Pest {
  id: string;
  name: string;
  emoji: string;
  affectedCrops: string[];
  symptoms: string[];
  prevention: string[];
  treatment: string[];
  dangerLevel: "Low" | "Medium" | "High";
}

const pests: Pest[] = [
  {
    id: "aphids",
    name: "Aphids",
    emoji: "🐛",
    affectedCrops: ["Apple", "Vegetables", "Mustard", "Wheat"],
    symptoms: ["Curling and yellowing of leaves", "Sticky honeydew on leaf surface", "Stunted plant growth", "Black sooty mold on leaves"],
    prevention: ["Encourage natural predators like ladybugs", "Use neem oil spray as deterrent", "Avoid excessive nitrogen fertilization", "Intercrop with marigold or basil"],
    treatment: ["Spray imidacloprid 17.8% SL @ 0.5ml/L", "Apply neem-based insecticide for organic control", "Use yellow sticky traps for monitoring"],
    dangerLevel: "Medium",
  },
  {
    id: "codling-moth",
    name: "Codling Moth",
    emoji: "🦋",
    affectedCrops: ["Apple", "Walnut", "Pear"],
    symptoms: ["Holes in fruit with frass (excrement)", "Premature fruit drop", "Larvae tunneling inside fruit", "Entry holes near calyx end"],
    prevention: ["Install pheromone traps by early April", "Remove fallen fruit regularly", "Scrape loose bark in winter to destroy pupae", "Use corrugated cardboard trunk bands"],
    treatment: ["Spray chlorantraniliprole @ 0.3ml/L at petal fall", "Apply CropGuard insecticide at 14-day intervals", "Use Bacillus thuringiensis (Bt) for organic orchards"],
    dangerLevel: "High",
  },
  {
    id: "rice-blast",
    name: "Rice Blast",
    emoji: "🍂",
    affectedCrops: ["Rice"],
    symptoms: ["Diamond-shaped lesions on leaves", "Neck rot causing panicle breakage", "White to gray centers with brown margins", "Severe yield loss in humid conditions"],
    prevention: ["Use resistant varieties", "Avoid excessive nitrogen application", "Maintain proper spacing between plants", "Ensure good field drainage"],
    treatment: ["Spray tricyclazole 75% WP @ 0.6g/L", "Apply FungiShield Pro at first sign of spots", "Repeat fungicide application after 10-14 days"],
    dangerLevel: "High",
  },
  {
    id: "whitefly",
    name: "Whitefly",
    emoji: "🪰",
    affectedCrops: ["Tomato", "Capsicum", "Cucumber", "Beans"],
    symptoms: ["White tiny insects on leaf undersides", "Yellowing and wilting of plants", "Viral disease transmission", "Honeydew secretion and sooty mold"],
    prevention: ["Use reflective mulches", "Install yellow sticky traps around field edges", "Remove weed hosts around the field", "Use insect-proof netting in nurseries"],
    treatment: ["Spray spiromesifen @ 1ml/L water", "Apply neem oil 1500 ppm as organic control", "Alternate between chemical groups to prevent resistance"],
    dangerLevel: "Medium",
  },
  {
    id: "powdery-mildew",
    name: "Powdery Mildew",
    emoji: "🌫️",
    affectedCrops: ["Apple", "Vegetables", "Cucurbits", "Peas"],
    symptoms: ["White powdery coating on leaves", "Leaf distortion and curling", "Premature leaf drop", "Reduced fruit quality"],
    prevention: ["Ensure proper air circulation", "Avoid overhead irrigation", "Prune crowded branches", "Choose resistant varieties"],
    treatment: ["Spray sulphur 80% WP @ 2g/L", "Apply FungiShield Pro for systemic action", "Use potassium bicarbonate for organic option"],
    dangerLevel: "Medium",
  },
  {
    id: "stem-borer",
    name: "Stem Borer",
    emoji: "🪱",
    affectedCrops: ["Rice", "Maize", "Sugarcane"],
    symptoms: ["Dead heart in vegetative stage", "White ear head at reproductive stage", "Bore holes in stems", "Frass inside stem tunnels"],
    prevention: ["Remove crop stubble after harvest", "Use pheromone traps for monitoring", "Plant early to avoid peak infestation", "Release Trichogramma egg parasitoids"],
    treatment: ["Apply carbofuran 3G in leaf whorl", "Spray chlorantraniliprole @ 0.4ml/L", "Use light traps to attract and kill adult moths"],
    dangerLevel: "High",
  },
];

const dangerColors: Record<string, string> = {
  Low: "text-primary bg-accent",
  Medium: "text-secondary bg-secondary/10",
  High: "text-destructive bg-destructive/10",
};

export default function PestGuidePage() {
  const [selected, setSelected] = useState<Pest | null>(null);

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <section className="hero-gradient py-12 md:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">🐛 Pest Identification Guide</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">Learn to identify common pests, understand symptoms, and find effective treatments.</p>
        </div>
      </section>

      <div className="container-custom py-12">
        {!selected ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pests.map((pest, i) => (
              <motion.button
                key={pest.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                onClick={() => setSelected(pest)}
                className="glass-card-hover rounded-xl p-6 text-left cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{pest.emoji}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${dangerColors[pest.dangerLevel]}`}>
                    {pest.dangerLevel} Risk
                  </span>
                </div>
                <h3 className="font-bold text-foreground text-lg mb-1">{pest.name}</h3>
                <p className="text-xs text-muted-foreground">
                  Affects: {pest.affectedCrops.join(", ")}
                </p>
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <button onClick={() => setSelected(null)} className="text-sm text-primary font-medium mb-6 flex items-center gap-1 hover:gap-2 transition-all">
              ← Back to all pests
            </button>

            <div className="glass-card rounded-2xl p-6 md:p-10">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-5xl">{selected.emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selected.name}</h2>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${dangerColors[selected.dangerLevel]}`}>
                    {selected.dangerLevel} Risk
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-8">Affects: {selected.affectedCrops.join(", ")}</p>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-secondary" /> Symptoms
                  </h3>
                  <ul className="space-y-2">
                    {selected.symptoms.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-secondary mt-0.5">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" /> Prevention
                  </h3>
                  <ul className="space-y-2">
                    {selected.prevention.map((p, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Bug className="h-4 w-4 text-destructive" /> Treatment
                  </h3>
                  <ul className="space-y-2">
                    {selected.treatment.map((t, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-destructive mt-0.5">•</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link to="/products">
                <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  Shop Pest Control Products <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

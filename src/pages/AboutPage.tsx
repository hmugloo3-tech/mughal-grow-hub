import { motion } from "framer-motion";
import { ShieldCheck, Heart, Award, Users, Leaf, Target } from "lucide-react";
import shopInterior from "@/assets/shop-interior.jpg";
import heroBg from "@/assets/hero-bg.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <section className="hero-gradient py-12 md:py-16">
        <div className="container-custom text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">About Us</h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">The story behind Mughal Pesticides & Fertilizer.</p>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Mughal Pesticides & Fertilizer was founded with a simple mission — to provide farmers in Kashmir with genuine, high-quality agricultural products at fair prices. Located in Gadole, Kokernag, Anantnag, we have been serving the farming community with dedication and trust.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Over the years, we have grown from a small local shop to a trusted name in agricultural supplies. We stock products from leading national and international brands, carefully selected to meet the specific needs of Kashmir's unique agricultural landscape.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our team includes experienced agronomists who provide personalized advice to farmers, helping them choose the right products for their crops and soil conditions.
              </p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
              <img src={shopInterior} alt="Our Shop" className="rounded-2xl shadow-lg w-full" loading="lazy" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="section-padding bg-accent/30">
        <div className="container-custom">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Our Mission & Values</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Target, title: "Our Mission", desc: "To empower farmers with the best agricultural solutions, helping them achieve maximum crop yield while promoting sustainable farming practices." },
              { icon: Heart, title: "Farmer First", desc: "Every decision we make puts farmers' needs first. We listen, understand, and provide solutions that truly help." },
              { icon: Leaf, title: "Sustainability", desc: "We promote eco-friendly products and organic alternatives, supporting a healthier environment for future generations." },
            ].map((item, i) => (
              <motion.div key={item.title} custom={i + 1} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="glass-card rounded-xl p-8 text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <img src={heroBg} alt="Our fields" className="rounded-2xl shadow-lg w-full" loading="lazy" />
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Trust & Quality Assurance</h2>
              <div className="space-y-4">
                {[
                  { icon: ShieldCheck, text: "100% genuine products from authorized distributors" },
                  { icon: Award, text: "Quality checked and certified products only" },
                  { icon: Users, text: "Trusted by 500+ farmers across Kashmir" },
                  { icon: Heart, text: "Personalized recommendations by expert staff" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-muted-foreground pt-2">{item.text}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

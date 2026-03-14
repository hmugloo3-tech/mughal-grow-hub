import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, ArrowRight, Leaf, Instagram, Facebook, Youtube } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden">
      {/* Top CTA strip with gradient */}
      <div className="relative bg-gradient-to-r from-secondary via-secondary to-secondary/90">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, hsl(var(--primary)) 0%, transparent 60%)' }} />
        <div className="container-custom py-5 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center">
              <Leaf className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-secondary-foreground">Ready to grow your yield?</p>
              <p className="text-xs text-secondary-foreground/70">Premium agri products delivered to your doorstep.</p>
            </div>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 px-7 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/30">
            Shop Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-black text-white">
        <div className="container-custom py-14 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-6">
                <img src={logo} alt="Mughal Grow Hub" className="h-14 w-14 rounded-2xl object-contain bg-background/10 p-1.5 ring-2 ring-background/10" />
                <div>
                <h3 className="font-display font-bold text-xl text-white">Mughal Grow Hub</h3>
                <p className="text-[10px] text-secondary uppercase tracking-[0.2em] font-semibold">Agriculture Solutions</p>
                </div>
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-6 max-w-xs">
                Kashmir's most trusted agriculture partner since 2010. Premium pesticides, fertilizers, seeds & expert farming guidance.
              </p>
              {/* Social Icons */}
              <div className="flex items-center gap-3">
                {[
                  { icon: Instagram, href: "#", label: "Instagram" },
                  { icon: Facebook, href: "#", label: "Facebook" },
                  { icon: Youtube, href: "#", label: "YouTube" },
                ].map((social) => (
                  <a key={social.label} href={social.href} aria-label={social.label}
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-secondary hover:border-secondary hover:text-secondary-foreground transition-all duration-300 text-white/50">
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h4 className="font-display font-bold text-sm text-secondary uppercase tracking-wider mb-5">Quick Links</h4>
              <div className="flex flex-col gap-3">
                {[
                  { name: "Home", path: "/" },
                  { name: "Products", path: "/products" },
                  { name: "Track Order", path: "/track-order" },
                  { name: "About Us", path: "/about" },
                  { name: "Contact", path: "/contact" },
                ].map((link) => (
                  <Link key={link.path} to={link.path} className="text-sm text-white/60 hover:text-secondary hover:translate-x-1 transition-all duration-200 flex items-center gap-1.5 group">
                    <span className="h-px w-0 group-hover:w-3 bg-secondary transition-all duration-200" />
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="lg:col-span-3">
              <h4 className="font-display font-bold text-sm text-secondary uppercase tracking-wider mb-5">Categories</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {["Fungicides", "Insecticides", "Fertilizers", "Micronutrients", "Seeds", "Farming Tools"].map((cat) => (
                  <Link key={cat} to="/products" className="text-sm text-background/50 hover:text-secondary hover:translate-x-1 transition-all duration-200 flex items-center gap-1.5 group">
                    <span className="h-px w-0 group-hover:w-3 bg-secondary transition-all duration-200" />
                    {cat}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="lg:col-span-3">
              <h4 className="font-display font-bold text-sm text-secondary uppercase tracking-wider mb-5">Get in Touch</h4>
              <div className="flex flex-col gap-4">
                <a href="https://maps.google.com/?q=Gadool+Ahlan+Kokernag+Anantnag" target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-background/50 hover:text-background/80 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
                    <MapPin className="h-4 w-4 text-secondary" />
                  </div>
                  <span className="leading-relaxed">Gadool Ahlan, Kokernag,<br />Anantnag - 192202, J&K</span>
                </a>
                <a href="tel:+916006561732"
                  className="flex items-center gap-3 text-sm text-background/50 hover:text-background/80 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
                    <Phone className="h-4 w-4 text-secondary" />
                  </div>
                  <span>+91 6006561732</span>
                </a>
                <a href="mailto:hamidmugloo89@gmail.com"
                  className="flex items-center gap-3 text-sm text-background/50 hover:text-background/80 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0 group-hover:bg-secondary/20 transition-colors">
                    <Mail className="h-4 w-4 text-secondary" />
                  </div>
                  <span>hamidmugloo89@gmail.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/5">
          <div className="container-custom py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-background/30">
            <span>© {currentYear} Mughal Grow Hub. All rights reserved.</span>
            <div className="flex items-center gap-1 text-background/20">
              <span>Crafted with</span>
              <Leaf className="h-3 w-3 text-secondary" />
              <span>for Kashmir's farmers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

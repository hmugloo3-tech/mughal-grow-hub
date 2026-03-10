import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Top CTA strip */}
      <div className="border-b border-primary-foreground/10">
        <div className="container-custom py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-display text-lg font-semibold">Ready to grow your yield?</p>
            <p className="text-sm text-primary-foreground/60">Get premium agri products delivered to your doorstep.</p>
          </div>
          <Link to="/products" className="inline-flex items-center gap-2 px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-secondary/90 transition-colors">
            Shop Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img src={logo} alt="Mughal Grow Hub" className="h-12 w-12 rounded-xl object-contain bg-primary-foreground/10 p-1" />
              <div>
                <h3 className="font-display font-bold text-lg">Mughal Grow Hub</h3>
                <p className="text-[10px] text-primary-foreground/50 uppercase tracking-[0.15em]">Agriculture Solutions</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Kashmir's trusted agriculture partner. Premium pesticides, fertilizers, and farming solutions since establishment.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-secondary mb-5">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { name: "Home", path: "/" },
                { name: "Products", path: "/products" },
                { name: "Track Order", path: "/track-order" },
                { name: "About Us", path: "/about" },
                { name: "Contact", path: "/contact" },
              ].map((link) => (
                <Link key={link.path} to={link.path} className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-secondary mb-5">Categories</h4>
            <div className="flex flex-col gap-2.5">
              {["Fungicides", "Insecticides", "Fertilizers", "Micronutrients", "Seeds", "Farming Tools"].map((cat) => (
                <Link key={cat} to="/products" className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors">
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-secondary mb-5">Get in Touch</h4>
            <div className="flex flex-col gap-3.5">
              <div className="flex items-start gap-2.5 text-sm text-primary-foreground/70">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-secondary" />
                <span>Kokernag, Gadole Ahlan, Anantnag - 192202, J&K</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-primary-foreground/70">
                <Phone className="h-4 w-4 shrink-0 text-secondary" />
                <a href="tel:+916006561732" className="hover:text-secondary transition-colors">+91 6006561732</a>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-primary-foreground/70">
                <Mail className="h-4 w-4 shrink-0 text-secondary" />
                <a href="mailto:hamidmugloo89@gmail.com" className="hover:text-secondary transition-colors">hamidmugloo89@gmail.com</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-primary-foreground/40">
          <span>© {new Date().getFullYear()} Mughal Grow Hub. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/track-order" className="hover:text-primary-foreground/70 transition-colors">Track Order</Link>
            <Link to="/contact" className="hover:text-primary-foreground/70 transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

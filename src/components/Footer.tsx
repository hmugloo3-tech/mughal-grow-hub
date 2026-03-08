import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="h-8 w-8 text-secondary" />
              <div>
                <h3 className="font-bold text-lg">Mughal Pesticides</h3>
                <p className="text-xs text-primary-foreground/70">& Fertilizer</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              Your trusted partner for healthy crops. Providing premium agricultural solutions since establishment.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-secondary mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[
                { name: "Home", path: "/" },
                { name: "Products", path: "/products" },
                { name: "About Us", path: "/about" },
                { name: "Blog", path: "/blog" },
                { name: "Contact", path: "/contact" },
              ].map((link) => (
                <Link key={link.path} to={link.path} className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-secondary mb-4">Products</h4>
            <div className="flex flex-col gap-2">
              {["Pesticides", "Fertilizers", "Seeds", "Growth Promoters", "Farming Tools"].map((cat) => (
                <Link key={cat} to="/products" className="text-sm text-primary-foreground/80 hover:text-secondary transition-colors">
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-secondary mb-4">Contact Us</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2 text-sm text-primary-foreground/80">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-secondary" />
                <span>Kashmir, Anantnag, Kokernag, Gadole - 192202</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Phone className="h-4 w-4 shrink-0 text-secondary" />
                <a href="tel:+916006561732" className="hover:text-secondary transition-colors">+91 6006561732</a>
              </div>
              <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <Mail className="h-4 w-4 shrink-0 text-secondary" />
                <a href="mailto:hamidmugloo89@gmail.com" className="hover:text-secondary transition-colors">hamidmugloo89@gmail.com</a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-10 pt-6 text-center text-sm text-primary-foreground/60">
          © {new Date().getFullYear()} Mughal Pesticides & Fertilizer. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

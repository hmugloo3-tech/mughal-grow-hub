import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Lock, ArrowLeft, ArrowRight, Leaf, ShieldCheck, Truck, Eye, EyeOff } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";

const features = [
  { icon: Leaf, text: "Premium Seeds & Fertilizers" },
  { icon: ShieldCheck, text: "100% Genuine Products" },
  { icon: Truck, text: "Home Delivery in Kashmir" },
];

const floatingShapes = [
  { size: 180, top: "10%", left: "5%", delay: 0, color: "hsl(var(--primary) / 0.08)" },
  { size: 120, top: "60%", right: "8%", delay: 1.5, color: "hsl(var(--secondary) / 0.12)" },
  { size: 90, bottom: "15%", left: "12%", delay: 3, color: "hsl(var(--primary) / 0.06)" },
  { size: 60, top: "25%", right: "20%", delay: 2, color: "hsl(var(--secondary) / 0.08)" },
];

export default function AuthPage() {
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const redirectTo = (location.state as any)?.from || "/";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
  if (user) return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setSubmitting(true);
    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      if (!name.trim()) { toast({ title: "Please enter your name", variant: "destructive" }); setSubmitting(false); return; }
      const { error } = await signUp(email, password, name);
      if (error) toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      else toast({ title: "Account created!", description: "Please check your email to verify your account." });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Floating background shapes */}
      {floatingShapes.map((shape, i) => (
        <motion.div key={i}
          className="absolute rounded-full blur-3xl pointer-events-none"
          style={{ width: shape.size, height: shape.size, backgroundColor: shape.color, top: shape.top, left: shape.left, right: (shape as any).right, bottom: (shape as any).bottom }}
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 6, delay: shape.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Left panel - branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary/90 to-primary/70 items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="relative z-10 max-w-md">
          <motion.img src={logo} alt="Mughal Pesticides & Fertilizer" className="w-28 h-28 object-contain mb-8 rounded-2xl bg-white/10 p-2 backdrop-blur-sm"
            whileHover={{ scale: 1.05, rotate: 2 }} />
          <h2 className="text-4xl font-extrabold text-primary-foreground mb-4 leading-tight">
            Your Trusted Partner for <span className="text-secondary">Healthy Crops</span>
          </h2>
          <p className="text-primary-foreground/70 text-lg mb-8 leading-relaxed">
            Join hundreds of farmers across Kashmir who trust us for premium agricultural products.
          </p>
          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div key={f.text} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.15 }}
                className="flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-primary-foreground/10">
                <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                  <f.icon className="h-5 w-5 text-secondary" />
                </div>
                <span className="text-primary-foreground font-medium">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-background">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <motion.img src={logo} alt="Mughal Pesticides" className="h-20 w-20 object-contain rounded-xl" whileHover={{ scale: 1.05 }} />
          </div>

          {/* Toggle tabs */}
          <div className="relative flex bg-muted rounded-xl p-1 mb-8">
            <button onClick={() => setIsLogin(true)}
              className={`flex-1 relative z-10 py-2.5 text-sm font-semibold rounded-lg transition-colors ${isLogin ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              Sign In
            </button>
            <button onClick={() => setIsLogin(false)}
              className={`flex-1 relative z-10 py-2.5 text-sm font-semibold rounded-lg transition-colors ${!isLogin ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              Sign Up
            </button>
            <motion.div className="absolute top-1 bottom-1 rounded-lg bg-primary" layout
              style={{ width: "calc(50% - 4px)" }}
              animate={{ left: isLogin ? 4 : "calc(50% + 0px)" }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={isLogin ? "login" : "signup"} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.25 }}>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                {isLogin ? "Welcome back! 👋" : "Create account 🌱"}
              </h1>
              <p className="text-muted-foreground mb-6 text-sm">
                {isLogin ? "Sign in to track orders & manage your account" : "Join us for easy ordering & home delivery"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="pl-10 h-12 rounded-xl border-border/60 bg-muted/40 focus:bg-background transition-colors" maxLength={100} required />
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="pl-10 h-12 rounded-xl border-border/60 bg-muted/40 focus:bg-background transition-colors" maxLength={255} required />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" className="pl-10 pr-10 h-12 rounded-xl border-border/60 bg-muted/40 focus:bg-background transition-colors" required minLength={6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button type="submit" disabled={submitting}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold text-base gap-2 shadow-lg shadow-primary/20">
                    {submitting ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                    ) : (
                      <>{isLogin ? "Sign In" : "Create Account"} <ArrowRight className="h-4 w-4" /></>
                    )}
                  </Button>
                </motion.div>
              </form>

              {isLogin && (
                <p className="text-center mt-4">
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot your password?</Link>
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <a href="https://wa.me/916006561732?text=Hi! I want to place an order." target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" className="w-full h-12 rounded-xl gap-2 font-semibold border-border/60 hover:bg-accent/50">
              📱 Order via WhatsApp
            </Button>
          </a>

          <div className="mt-8 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to website
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Camera, Upload, Leaf, AlertTriangle, ShieldCheck, Bug, FlaskConical,
  Clock, Droplets, ArrowRight, RotateCcw, History, Trash2, ChevronDown, ChevronUp, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SEO from "@/components/SEO";

interface Treatment {
  recommended_pesticide: string;
  dosage_per_acre: string;
  best_spray_time: string;
  preventive_measures: string[];
  organic_options: string[];
}

interface DetectionResult {
  is_healthy: boolean;
  crop_name: string;
  disease_name: string;
  confidence: number;
  severity: string;
  symptoms: string;
  causes: string;
  treatment: Treatment;
  safety_tips: string[];
}

interface HistoryItem {
  id: string;
  crop_name: string;
  disease_name: string;
  confidence: number;
  severity: string;
  is_healthy: boolean;
  created_at: string;
  image_url: string | null;
}

const severityColors: Record<string, string> = {
  None: "bg-leaf/15 text-leaf border-leaf/30",
  Low: "bg-secondary/15 text-secondary border-secondary/30",
  Medium: "bg-orange-500/15 text-orange-600 border-orange-500/30",
  High: "bg-destructive/15 text-destructive border-destructive/30",
};

export default function CropDiseaseDetectorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Load history
  useEffect(() => {
    if (!user) return;
    supabase
      .from("disease_detections")
      .select("id, crop_name, disease_name, confidence, severity, is_healthy, created_at, image_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setHistory((data as HistoryItem[]) || []));
  }, [user, result]);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload a JPG or PNG image.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image under 10MB.", variant: "destructive" });
      return;
    }
    setMimeType(file.type);
    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const analyzeImage = async () => {
    if (!imageBase64) return;
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-disease`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ imageBase64, mimeType }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data: DetectionResult = await res.json();
      setResult(data);

      // Save to history if logged in
      if (user) {
        await supabase.from("disease_detections").insert({
          user_id: user.id,
          crop_name: data.crop_name,
          disease_name: data.disease_name,
          confidence: data.confidence,
          severity: data.severity,
          symptoms: data.symptoms,
          causes: data.causes,
          treatment: data.treatment as any,
          safety_tips: data.safety_tips,
          is_healthy: data.is_healthy,
        });
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
      toast({ title: "Analysis Failed", description: e.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const resetScan = () => {
    setImagePreview(null);
    setImageBase64(null);
    setResult(null);
    setError(null);
  };

  const deleteHistory = async (id: string) => {
    await supabase.from("disease_detections").delete().eq("id", id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <SEO
        title="Crop Disease Detector – AI Plant Diagnosis | Mughal Pesticides"
        description="Upload a leaf photo to detect crop diseases instantly with AI. Get treatment advice, pesticide recommendations, and organic alternatives."
      />

      {/* Hero */}
      <section className="hero-gradient py-10 md:py-14">
        <div className="container-custom text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-foreground/20 text-primary-foreground text-xs font-semibold mb-4">
              <Bug className="h-3.5 w-3.5" /> AI-Powered Diagnostics
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
              🔬 Crop Disease Detector
            </h1>
            <p className="text-primary-foreground/80 max-w-xl mx-auto text-sm md:text-base">
              Upload a photo of any crop leaf and our AI will instantly identify diseases, suggest treatments, and recommend the right products.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-custom py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Upload Area */}
          <AnimatePresence mode="wait">
            {!result && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-8"
              >
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.02]"
                      : imagePreview
                        ? "border-primary/40 bg-accent/30"
                        : "border-border bg-card hover:border-primary/50 hover:bg-accent/20"
                  } p-6 md:p-10`}
                >
                  {imagePreview ? (
                    <div className="space-y-5">
                      <div className="relative max-w-sm mx-auto">
                        <img
                          src={imagePreview}
                          alt="Uploaded leaf"
                          className="w-full rounded-xl shadow-lg border border-border"
                        />
                        <button
                          onClick={resetScan}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-destructive/10 transition-colors"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>

                      <div className="text-center">
                        <Button
                          onClick={analyzeImage}
                          disabled={analyzing}
                          size="lg"
                          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 min-w-[200px]"
                        >
                          {analyzing ? (
                            <>
                              <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                              Analyzing Leaf...
                            </>
                          ) : (
                            <>
                              <Leaf className="h-4 w-4" /> Detect Disease
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-5">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10">
                        <Camera className="h-10 w-10 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">Upload a Leaf Photo</h3>
                        <p className="text-sm text-muted-foreground">
                          Drag & drop an image here, or use the buttons below
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG • Max 10MB</p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          variant="outline"
                          className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                        >
                          <Upload className="h-4 w-4" /> Browse Files
                        </Button>
                        <Button
                          onClick={() => cameraInputRef.current?.click()}
                          className="gap-2 bg-primary text-primary-foreground"
                        >
                          <Camera className="h-4 w-4" /> Take Photo
                        </Button>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
                  />
                </div>

                {/* Analyzing animation */}
                {analyzing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 text-center"
                  >
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-accent border border-border">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2.5 h-2.5 rounded-full bg-primary"
                            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-foreground">AI is analyzing the leaf pattern...</span>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-center">
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {result && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Header card */}
                <div className={`rounded-2xl border p-6 ${result.is_healthy ? "bg-leaf/5 border-leaf/30" : "bg-destructive/5 border-destructive/20"}`}>
                  <div className="flex flex-col sm:flex-row gap-5">
                    {imagePreview && (
                      <img src={imagePreview} alt="Analyzed leaf" className="w-28 h-28 rounded-xl object-cover border border-border flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${severityColors[result.severity] || severityColors.None}`}>
                          {result.is_healthy ? "✅ Healthy" : `⚠️ ${result.severity} Severity`}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground border border-border">
                          🌿 {result.crop_name}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          {result.confidence}% confidence
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-foreground mb-1">{result.disease_name}</h2>
                      {!result.is_healthy && (
                        <p className="text-sm text-muted-foreground">{result.symptoms}</p>
                      )}
                    </div>
                  </div>
                </div>

                {!result.is_healthy && (
                  <>
                    {/* Causes */}
                    <div className="rounded-2xl border border-border bg-card p-5">
                      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                        <Bug className="h-4 w-4 text-destructive" /> Causes
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{result.causes}</p>
                    </div>

                    {/* Treatment */}
                    <div className="rounded-2xl border border-border bg-card p-5">
                      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                        <FlaskConical className="h-4 w-4 text-primary" /> Treatment Recommendations
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="p-3 rounded-xl bg-accent/50 border border-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">💊 Recommended Pesticide</p>
                            <p className="text-sm font-medium text-foreground">{result.treatment.recommended_pesticide}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-accent/50 border border-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                              <Droplets className="h-3 w-3" /> Dosage per Acre
                            </p>
                            <p className="text-sm font-medium text-foreground">{result.treatment.dosage_per_acre}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-accent/50 border border-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Best Spray Time
                            </p>
                            <p className="text-sm font-medium text-foreground">{result.treatment.best_spray_time}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="p-3 rounded-xl bg-accent/50 border border-border">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">🛡️ Preventive Measures</p>
                            <ul className="space-y-1">
                              {result.treatment.preventive_measures.map((m, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <span className="text-primary mt-0.5">•</span> {m}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="p-3 rounded-xl bg-leaf/5 border border-leaf/20">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">🌿 Organic Options</p>
                            <ul className="space-y-1">
                              {result.treatment.organic_options.map((o, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                                  <span className="text-leaf mt-0.5">•</span> {o}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Safety Tips */}
                    <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-5">
                      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                        <ShieldCheck className="h-4 w-4 text-secondary" /> Safety Tips
                      </h3>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {result.safety_tips.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <span className="text-secondary mt-0.5 font-bold">{i + 1}.</span> {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {result.is_healthy && (
                  <div className="rounded-2xl border border-leaf/30 bg-leaf/5 p-6 text-center">
                    <Leaf className="h-12 w-12 text-leaf mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-foreground mb-2">Your plant looks healthy! 🎉</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      No disease symptoms detected. Keep following good agricultural practices to maintain plant health.
                    </p>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-accent border border-border">
                  <AlertTriangle className="h-5 w-5 text-secondary flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Advisory Notice:</strong> AI results are for guidance only. Farmers should confirm diagnosis with local agriculture experts or Krishi Vigyan Kendra (KVK) before applying treatments.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button onClick={resetScan} variant="outline" className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <RotateCcw className="h-4 w-4" /> Scan Another Leaf
                  </Button>
                  <Link to="/products">
                    <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
                      Shop Treatments <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Detection History */}
          {user && history.length > 0 && (
            <div className="mt-10">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 text-sm font-semibold text-foreground mb-4 hover:text-primary transition-colors"
              >
                <History className="h-4 w-4" /> Detection History ({history.length})
                {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2">
                      {history.map((h) => (
                        <div key={h.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                          <div className="flex items-center gap-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${h.is_healthy ? "bg-leaf" : h.severity === "High" ? "bg-destructive" : h.severity === "Medium" ? "bg-orange-500" : "bg-secondary"}`} />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {h.disease_name} <span className="text-xs text-muted-foreground">({h.crop_name})</span>
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(h.created_at).toLocaleDateString()} • {h.confidence}% confidence
                              </p>
                            </div>
                          </div>
                          <button onClick={() => deleteHistory(h.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {!user && (
            <div className="mt-8 text-center p-5 rounded-xl bg-accent border border-border">
              <p className="text-sm text-muted-foreground mb-3">
                <Link to="/auth" className="text-primary font-semibold hover:underline">Sign in</Link> to save your detection history and track crop health over time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

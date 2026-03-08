export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  benefits?: string[];
  usage?: string;
}

export const categories = [
  { id: "pesticides", name: "Pesticides", icon: "🛡️" },
  { id: "fertilizers", name: "Fertilizers", icon: "🌱" },
  { id: "seeds", name: "Seeds", icon: "🌾" },
  { id: "growth-promoters", name: "Growth Promoters", icon: "📈" },
  { id: "tools", name: "Farming Tools", icon: "🔧" },
];

export const products: Product[] = [
  {
    id: "1", name: "CropGuard Insecticide", category: "pesticides",
    description: "Broad-spectrum insecticide for effective pest control on all major crops. Safe for beneficial insects when used as directed.",
    price: 450, stock: 50, image: "/product-pesticide.jpg",
    benefits: ["Fast-acting formula", "Long-lasting protection", "Rain-resistant"],
    usage: "Mix 2ml per litre of water. Spray evenly on affected crops during early morning or evening."
  },
  {
    id: "2", name: "FungiShield Pro", category: "pesticides",
    description: "Advanced fungicide that provides systemic protection against powdery mildew, rust, and blight.",
    price: 620, stock: 35, image: "/product-pesticide.jpg",
    benefits: ["Systemic action", "Prevents & cures", "Compatible with other products"],
    usage: "Apply 1.5ml per litre of water at first sign of disease. Repeat every 10-14 days."
  },
  {
    id: "3", name: "NPK 19-19-19", category: "fertilizers",
    description: "Balanced NPK fertilizer for overall plant growth. Ideal for vegetables, fruits, and flowering plants.",
    price: 380, stock: 100, image: "/product-fertilizer.jpg",
    benefits: ["Balanced nutrition", "Quick absorption", "Increases yield"],
    usage: "Apply 5g per plant or 50g per square meter. Water thoroughly after application."
  },
  {
    id: "4", name: "Organic Vermicompost", category: "fertilizers",
    description: "100% organic vermicompost enriched with beneficial microorganisms. Improves soil structure and fertility.",
    price: 250, stock: 200, image: "/product-fertilizer.jpg",
    benefits: ["100% organic", "Improves soil health", "Eco-friendly"],
    usage: "Mix 500g per plant or spread evenly across garden beds before planting."
  },
  {
    id: "5", name: "Hybrid Tomato Seeds", category: "seeds",
    description: "High-yielding hybrid tomato seeds with excellent disease resistance. Produces firm, round fruits.",
    price: 120, stock: 500, image: "/product-seeds.jpg",
    benefits: ["High germination rate", "Disease resistant", "Heavy yielding"],
    usage: "Sow in nursery beds, transplant after 25-30 days. Space 60cm apart."
  },
  {
    id: "6", name: "Premium Wheat Seeds", category: "seeds",
    description: "Certified wheat seeds suitable for Kashmir climate. Early maturing variety with high protein content.",
    price: 180, stock: 300, image: "/product-seeds.jpg",
    benefits: ["Climate adapted", "Early maturing", "High protein"],
    usage: "Sow at rate of 100kg per hectare in well-prepared field."
  },
  {
    id: "7", name: "GrowMax Plus", category: "growth-promoters",
    description: "Plant growth promoter with amino acids and seaweed extract. Enhances root development and flowering.",
    price: 350, stock: 75, image: "/product-growth.jpg",
    benefits: ["Boosts growth", "Better flowering", "Stronger roots"],
    usage: "Dilute 3ml per litre of water. Foliar spray every 15 days."
  },
  {
    id: "8", name: "HumiGold", category: "growth-promoters",
    description: "Humic acid-based soil conditioner that improves nutrient uptake and soil microbiological activity.",
    price: 290, stock: 60, image: "/product-growth.jpg",
    benefits: ["Improves nutrient uptake", "Soil conditioner", "Cost-effective"],
    usage: "Apply 500ml per acre through drip irrigation or soil drenching."
  },
  {
    id: "9", name: "Professional Pruning Shears", category: "tools",
    description: "Heavy-duty pruning shears with ergonomic grip. Perfect for trimming, shaping, and harvesting.",
    price: 550, stock: 40, image: "/product-tools.jpg",
    benefits: ["Sharp blade", "Ergonomic design", "Durable steel"],
  },
  {
    id: "10", name: "Garden Sprayer 16L", category: "tools",
    description: "Battery-operated knapsack sprayer with adjustable nozzle. Ideal for pesticide and fertilizer application.",
    price: 2200, stock: 20, image: "/product-tools.jpg",
    benefits: ["Battery powered", "Adjustable pressure", "Large capacity"],
  },
];

export const blogPosts = [
  {
    id: "1",
    title: "5 Essential Tips for Pest Control in Apple Orchards",
    excerpt: "Learn effective and eco-friendly methods to protect your apple orchards from common pests in the Kashmir region.",
    image: "/product-pesticide.jpg",
    date: "2026-02-15",
    category: "Pest Control",
  },
  {
    id: "2",
    title: "Understanding NPK Ratios: A Farmer's Guide",
    excerpt: "Demystifying fertilizer labels and helping you choose the right NPK ratio for your specific crops.",
    image: "/product-fertilizer.jpg",
    date: "2026-02-01",
    category: "Fertilizers",
  },
  {
    id: "3",
    title: "Best Practices for Wheat Cultivation in Kashmir",
    excerpt: "Season-wise guide for wheat farmers covering sowing, irrigation, fertilization, and harvesting techniques.",
    image: "/product-seeds.jpg",
    date: "2026-01-20",
    category: "Crop Guide",
  },
  {
    id: "4",
    title: "Organic Farming: Getting Started with Vermicompost",
    excerpt: "How to transition to organic farming using vermicompost and reduce chemical dependency for healthier soil.",
    image: "/product-growth.jpg",
    date: "2026-01-10",
    category: "Organic Farming",
  },
];

export const testimonials = [
  {
    name: "Abdul Rashid",
    role: "Apple Farmer, Anantnag",
    text: "Mughal Pesticides has been my go-to shop for all farming needs. Their products are genuine and the staff is very knowledgeable.",
  },
  {
    name: "Mohammad Ashraf",
    role: "Rice Farmer, Kokernag",
    text: "The quality of fertilizers I get from here has significantly improved my crop yield. Highly recommended for all farmers.",
  },
  {
    name: "Ghulam Nabi",
    role: "Vegetable Grower, Gadole",
    text: "Best agriculture shop in the area. They always have the latest products and provide excellent farming advice.",
  },
];

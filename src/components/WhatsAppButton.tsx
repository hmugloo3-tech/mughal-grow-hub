import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/916006561732?text=Hi!%20I'm%20interested%20in%20your%20products."
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-40 bg-[#25D366] text-white p-3.5 lg:p-4 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform duration-200"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-5 w-5 lg:h-6 lg:w-6" />
    </a>
  );
}

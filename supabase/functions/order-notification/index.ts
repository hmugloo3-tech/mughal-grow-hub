import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { order_id, status, customer_phone, customer_name, total_price } = await req.json();

    if (!order_id || !status) {
      return new Response(JSON.stringify({ error: "Missing order_id or status" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const statusMessages: Record<string, string> = {
      pending: `🛒 Order Received!\nHi ${customer_name || "Customer"}, your order #${order_id.slice(0, 8)} of ₹${total_price} has been received. We'll confirm it shortly.`,
      confirmed: `✅ Order Confirmed!\nHi ${customer_name || "Customer"}, your order #${order_id.slice(0, 8)} of ₹${total_price} has been confirmed and is being prepared.`,
      shipped: `🚚 Order Shipped!\nHi ${customer_name || "Customer"}, your order #${order_id.slice(0, 8)} has been shipped and is on its way!`,
      delivered: `📦 Order Delivered!\nHi ${customer_name || "Customer"}, your order #${order_id.slice(0, 8)} has been delivered. Thank you for shopping with Mughal Agri Store!`,
      cancelled: `❌ Order Cancelled\nHi ${customer_name || "Customer"}, your order #${order_id.slice(0, 8)} has been cancelled. Contact us if you have any questions.`,
    };

    const message = statusMessages[status] || `Order #${order_id.slice(0, 8)} status updated to: ${status}`;

    // Build WhatsApp notification URL
    const phone = customer_phone?.replace(/[^0-9]/g, "") || "";
    const whatsappUrl = phone
      ? `https://wa.me/${phone.startsWith("91") ? phone : "91" + phone}?text=${encodeURIComponent(message)}`
      : null;

    // Also notify the shop owner
    const ownerPhone = "916006561732";
    const ownerMsg = `📋 Order Update\nOrder #${order_id.slice(0, 8)}\nCustomer: ${customer_name || "N/A"}\nPhone: ${customer_phone || "N/A"}\nAmount: ₹${total_price}\nStatus: ${status.toUpperCase()}`;
    const ownerWhatsappUrl = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(ownerMsg)}`;

    return new Response(
      JSON.stringify({
        success: true,
        message,
        customer_whatsapp_url: whatsappUrl,
        owner_whatsapp_url: ownerWhatsappUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

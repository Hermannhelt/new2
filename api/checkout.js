// Creates a Stripe Checkout session for the cart.
// Prices are always taken from catalog.json on the server, never from the browser.
const Stripe = require("stripe");
const catalog = require("./catalog.json");

const EU_AND_MORE = ["DK","SE","NO","FI","IS","DE","NL","BE","LU","FR","ES","PT","IT","AT","CH","IE","GB","PL","CZ","SK","HU","SI","HR","EE","LV","LT","GR","CY","MT","RO","BG","US","CA","AU","NZ","JP","SG","HK","KR"];

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }
  if (!process.env.STRIPE_SECRET_KEY) { res.status(500).json({ error: "Payment is not set up yet" }); return; }
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const items = Array.isArray(body.items) ? body.items.slice(0, 20) : [];
    const origin = `https://${req.headers.host}`;
    let subtotal = 0;
    const line_items = items.map(({ id, k, q }) => {
      const pr = catalog.prints.find(p => p.id === id);
      const size = pr && pr.sizes[Number(k)];
      const qty = Math.max(1, Math.min(5, parseInt(q, 10) || 1));
      if (!pr || !size) throw new Error("Unknown print");
      subtotal += size.price * qty;
      return {
        quantity: qty,
        price_data: {
          currency: catalog.currency,
          unit_amount: size.price * 100,
          product_data: {
            name: `${pr.title} – ${pr.series}`,
            description: `${size.label} · Edition ${size.edition} · Archival pigment print, signed and numbered`,
            images: [`${origin}/${pr.image}`],
            metadata: { print: pr.id, size: size.label },
          },
        },
      };
    });
    if (!line_items.length) { res.status(400).json({ error: "Your cart is empty" }); return; }
    const shipping = subtotal >= catalog.freeShippingFrom ? 0 : catalog.shipping;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      shipping_address_collection: { allowed_countries: EU_AND_MORE },
      shipping_options: [{
        shipping_rate_data: {
          type: "fixed_amount",
          display_name: shipping ? "Shipping (PostNord / FedEx Express)" : "Free shipping",
          fixed_amount: { amount: shipping * 100, currency: catalog.currency },
          delivery_estimate: { minimum: { unit: "week", value: 1 }, maximum: { unit: "week", value: 3 } },
        },
      }],
      phone_number_collection: { enabled: true },
      consent_collection: { terms_of_service: "required" },
      custom_text: { terms_of_service_acceptance: { message: "I agree to the [Terms of Sale](https://kenhermann.dk/#terms)." } },
      success_url: `${origin}/?order=success`,
      cancel_url: `${origin}/?order=cancelled`,
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Checkout could not be created" });
  }
};

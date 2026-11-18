// Creates a Stripe Checkout session for the €300 workshop deposit.
// The amount is fixed here on the server, never taken from the browser.
const Stripe = require("stripe");

const WORKSHOP = {
  name: "Photography Workshop – April 1–4, 2027, Sweden",
  description: "Non-refundable deposit that secures your place. The remaining balance is due by 15 February 2027.",
  deposit: 300, // EUR
  image: "img/workshop/house.jpg",
};

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }
  if (!process.env.STRIPE_SECRET_KEY) { res.status(500).json({ error: "Payment is not set up yet" }); return; }
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const origin = `https://${req.headers.host}`;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: WORKSHOP.deposit * 100,
          product_data: {
            name: `${WORKSHOP.name} – deposit`,
            description: WORKSHOP.description,
            images: [`${origin}/${WORKSHOP.image}`],
            metadata: { workshop: "2027-04" },
          },
        },
      }],
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      metadata: { workshop: "2027-04" },
      payment_intent_data: { metadata: { workshop: "2027-04" }, description: "Workshop April 2027 – deposit" },
      custom_text: {
        submit: { message: "The €300 deposit is non-refundable and secures your place. By 1 February 2027 Ken confirms the workshop is going ahead – if it is cancelled, you receive a full refund." },
      },
      success_url: `${origin}/?workshop=booked#workshop`,
      cancel_url: `${origin}/#workshop`,
    });
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Checkout could not be created" });
  }
};

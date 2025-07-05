const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const expressAsyncHandler = require("express-async-handler");
const { Booking } = require("../models");

exports.stripeWebhookHandler = expressAsyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (
      event.type === "checkout.session.completed" ||
      event.type === "charge.succeeded"
    ) {
      const session = event.data.object;
      const stripeSessionId = session.id;

      // console.log("🔔 Stripe Session ID from webhook:", stripeSessionId);
      // console.log("🔔🔔", process.env.STRIPE_WEBHOOK_SECRET);
      // console.log("🔔🔔🔔🔔", sig);

      // console.log("Webhook received:", event.type);
      // console.log("Event data:", JSON.stringify(event.data.object, null, 2));

      const booking = await Booking.findOne({ where: { stripeSessionId } });
      if (!booking) return res.status(404).send("Booking not found");

      await booking.update({
        paymentStatus: "paid",
        status: "confirmed",
      });

      // console.log(`Booking ${booking.id} marked as paid`);
    }
  } catch (error) {
    // console.error("Error updating booking:", error.message);
    return res.status(500).send("Server error");
  }

  res.status(200).json({ received: true });
});

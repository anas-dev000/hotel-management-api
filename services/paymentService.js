const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.createStripeSession = async (booking, room, req) => {
  const session = await stripe.checkout.sessions.create({
    // Only card payments are accepted
    payment_method_types: ["card"],

    // Define the item being purchased (room)
    line_items: [
      {
        price_data: {
          currency: "egp", // Egyptian Pounds
          product_data: {
            name: room.name, // Room name shown on Stripe checkout
          },
          unit_amount: Math.round(booking.totalPrice * 100), // Stripe expects amount in "cents"
        },
        quantity: 1,
      },
    ],

    // One-time payment mode
    mode: "payment",

    // Redirect URL after successful payment and URL if user cancels payment
    success_url: `${process.env.BASE_URL}/api/v1/bookings/success`,
    cancel_url: `${process.env.BASE_URL}/api/v1/bookings/cancel`,

    // Pass booking ID in metadata for later use (e.g., in webhook)
    metadata: {
      bookingId: booking.id,
    },
  });
  return session;
};

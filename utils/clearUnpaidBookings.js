// If the customer does not pay within a certain time
// → cancel the reservation and return the room.
const cron = require("node-cron");
// node-cron: A library that lets us run code every period of time (similar to a schedule in Linux).
const { Booking, Room } = require("../models");
const { Op } = require("sequelize");

cron.schedule("*/20 * * * *", async () => {
  //Run the code every 20 minutes.
  // console.log("Running clear unpaid bookings job...");
  const threshold = new Date(Date.now() - 15 * 60 * 1000);

  const expiredBookings = await Booking.findAll({
    where: {
      status: "pending",
      paymentMethod: "card",
      createdAt: { [Op.lt]: threshold },
    },
  });

  for (const booking of expiredBookings) {
    const room = await Room.findByPk(booking.roomId);
    if (room) {
      await room.update({ availability: true });
    }

    // console.log(
    //   `Booking ${booking.id} will be deleted (createdAt: ${booking.createdAt})`
    // );

    if (process.env.NODE_ENV === "production") {
      await booking.destroy();
      console.log(`Booking ${booking.id} deleted due to no payment !!`);
    }
  }
});

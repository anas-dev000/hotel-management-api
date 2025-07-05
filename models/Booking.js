const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnection");
const User = require("./User");
const Room = require("./Room");

const Booking = sequelize.define(
  "Booking",
  {
    // Primary key for the booking
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // Foreign key to the user making the booking
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    // Foreign key to the booked room
    roomId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Room,
        key: "id",
      },
    },
    // Check-in date for the booking
    checkInDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: "Invalid check-in date" },
      },
    },
    // Check-out date for the booking
    checkOutDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: { msg: "Invalid check-out date" },
        isAfterCheckIn(value) {
          if (new Date(value) <= new Date(this.checkInDate)) {
            throw new Error("Check-out date must be after check-in date");
          }
        },
      },
    },
    // Total price for the booking
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: { args: [0], msg: "Total price cannot be negative" },
      },
    },
    // Payment status of the booking
    paymentStatus: {
      type: DataTypes.ENUM("pending", "paid", "failed"),
      defaultValue: "pending",
    },
    // Payment method used
    paymentMethod: {
      type: DataTypes.ENUM("card", "cash"),
      defaultValue: "card",
    },
    // Status of the booking
    status: {
      type: DataTypes.ENUM(
        "confirmed",
        "pending",
        "cancelled",
        "checked-in",
        "checked-out"
      ),
      defaultValue: "pending",
    },
    stripeSessionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "bookings",
    timestamps: true,
    paranoid: true,
    indexes: [{ fields: ["userId"] }, { fields: ["roomId"] }],
  }
);

// Hook to calculate totalPrice based on room's pricePerNight and number of nights
Booking.addHook("beforeValidate", async (booking) => {
  if (
    booking.isNewRecord ||
    booking.changed("checkInDate") ||
    booking.changed("checkOutDate") ||
    booking.changed("roomId")
  ) {
    const room = await Room.findByPk(booking.roomId);
    if (!room) {
      throw new Error("Room not found");
    }
    const timeDifference =
      new Date(booking.checkOutDate) - new Date(booking.checkInDate);
    const nights = timeDifference / (1000 * 60 * 60 * 24);

    if (nights <= 0) {
      throw new Error("Invalid date range");
    }
    booking.totalPrice = (room.pricePerNight * nights).toFixed(2);
  }
});

// Define relationships
Booking.associate = (models) => {
  Booking.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });
  Booking.belongsTo(models.Room, {
    foreignKey: "roomId",
    as: "room",
  });
};

module.exports = Booking;

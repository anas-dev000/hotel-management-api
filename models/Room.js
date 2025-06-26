const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnection");
const Hotel = require("./Hotel");

const Room = sequelize.define(
  "Room",
  {
    // Primary key for the room
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // Name of the room
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Room name is required" },
        len: [3, 100],
      },
    },
    // Description of the room
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500],
      },
    },
    // Price per night for the room
    pricePerNight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: { msg: "Price must be a decimal number" },
        min: {
          args: [0],
          msg: "Price per night cannot be negative",
        },
      },
    },
    // Type of the room
    roomType: {
      type: DataTypes.ENUM("single", "double", "suite"),
      allowNull: false,
    },
    // Availability status of the room
    availability: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Maximum capacity of the room
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    // Foreign key to the hotel
    hotelId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Hotel,
        key: "id",
      },
    },
    // Main image URL for the room
    imageCover: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Array of additional image URLs
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
  },
  {
    tableName: "rooms",
    timestamps: true,
    paranoid: true,
    indexes: [{ fields: ["hotelId"] }],
  }
);

// Define relationship
Room.associate = (models) => {
  Room.belongsTo(models.Hotel, {
    foreignKey: "hotelId",
    as: "hotel",
  });
};

module.exports = Room;
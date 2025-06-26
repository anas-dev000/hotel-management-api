const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnection");

const Hotel = sequelize.define(
  "Hotel",
  {
    // Primary key for the hotel
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // Name of the hotel
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Hotel name is required" },
        len: [3, 100],
      },
    },
    // Description of the hotel
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500],
      },
    },
    // Location of the hotel
    location: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Location is required" },
      },
    },
    // Main image URL for the hotel
    imageCover: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Array of additional image URLs
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    // Star rating of the hotel (1-5)
    starRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5,
      },
    },
  },
  {
    tableName: "hotels",
    timestamps: true,
    paranoid: true,
  }
);

// Define relationships
Hotel.associate = (models) => {
  Hotel.hasMany(models.Room, {
    foreignKey: "hotelId",
    as: "rooms",
  });
  Hotel.hasMany(models.User, {
    foreignKey: "hotelId",
    as: "users",
  });
};

module.exports = Hotel;

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConnection");
const bcrypt = require("bcryptjs");
const Hotel = require("./Hotel");

const User = sequelize.define(
  "User",
  {
    // Primary key for the user
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    // Name of the user
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "User name is required" },
        len: [3, 100],
      },
    },
    // Email address of the user
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: "Invalid email format" },
      },
    },
    // Hashed password of the user
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [8, 100],
          msg: "Password must be at least 8 characters",
        },
      },
    },
    // Phone number of the user
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Nationality of the user
    nationality: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Passport number of the user
    passportNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Role of the user
    role: {
      type: DataTypes.ENUM("guest", "admin", "receptionist"),
      defaultValue: "guest",
    },
    // Active status of the user
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Number of warnings issued to the user
    warnings: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    // Foreign key to the hotel (for receptionists)
    hotelId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: Hotel,
        key: "id",
      },
    },
  },
  {
    tableName: "users",
    timestamps: true,
    paranoid: true,
    indexes: [{ fields: ["hotelId"] }],
  }
);

// Hash password before saving
User.addHook("beforeSave", async (user) => {
  if (user.changed("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

// Add method to compare passwords
User.prototype.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Define relationship
User.associate = (models) => {
  User.belongsTo(models.Hotel, {
    foreignKey: "hotelId",
    as: "hotel",
  });
};

module.exports = User;

const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.PGDatabaseName,
  process.env.PGUser,
  process.env.PGPassword,
  {
    host: process.env.PGHost,
    port: process.env.PGPort,
    dialect: "postgres",
    logging: false,
    define: {
      timestamps: true,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connected successfully.");
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("✅ Tables synced successfully");
      console.log("Database synchronized in development mode.");
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

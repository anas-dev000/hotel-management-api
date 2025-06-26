const fs = require("fs");
const path = require("path");
const { sequelize } = require("../config/dbConnection");

const models = {};

// Read all files in the models directory (except index.js)
fs.readdirSync(__dirname)
  .filter((file) => file !== "index.js" && file.endsWith(".js"))
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    models[model.name] = model;
  });

// Run associations
Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = { sequelize, ...models };

const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Estabilishment = sequelize.define("Estabilishment", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Estabilishment;

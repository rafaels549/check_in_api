const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require('./User'); // Garantir que está importando o modelo User corretamente

const Estabilishment = sequelize.define("Estabilishment", {
  name: { 
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', 
      key: 'id',
    },
  },
});



module.exports = Estabilishment;

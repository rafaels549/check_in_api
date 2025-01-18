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
  cnpj: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, 
    validate: {
      is: /^[0-9]{14}$/,
    },
  },
  image: { 
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User, 
      key: 'id',
    },
  },
});

module.exports = Estabilishment;

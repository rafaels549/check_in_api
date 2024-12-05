const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 
const Estabilishment = require('./Estabilishment');

const Product = sequelize.define('Product', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,  
    allowNull: true,      
  },
  ownerId: {  
    type: DataTypes.INTEGER,
    references: {
      model: Estabilishment,
      key: 'id', 
    },
    allowNull: false, 
  },
});

module.exports = Product;

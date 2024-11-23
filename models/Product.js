const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 

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
      model: 'Estabilishments',
      key: 'id', 
    },
    allowNull: false, 
  },
});

module.exports = Product;

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Estabilishment = require('./Estabilishment'); 

const User = sequelize.define('User', {
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  user_role: {
    type: DataTypes.ENUM('ADMIN', 'USER', 'DEVELOPER'),
    allowNull: false,
    defaultValue: 'USER',
  },
});

User.hasMany(Estabilishment, {
  foreignKey: 'user_id',
  as: 'establishments',
});
Estabilishment.belongsTo(User);
module.exports = User;

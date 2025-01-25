const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");


const QrCode = sequelize.define("QrCode", {
  qr_code_data: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  qr_code_image: {
    type: DataTypes.TEXT, 
    allowNull: false,
  },
  estabilishment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Estabilishments',
      key: "id",
    },
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
}, {
  tableName: "qr_codes",
  timestamps: false,
});


module.exports = QrCode;

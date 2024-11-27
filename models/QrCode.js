const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Estabilishment = require("./Estabilishment");

const QrCode = sequelize.define("QrCode", {
  qr_code_data: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  estabilishment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Estabilishment,
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

Estabilishment.hasMany(QrCode, {
  foreignKey: "estabilishment_id",
  as: "qrCodes",
});

QrCode.belongsTo(Estabilishment);

module.exports = QrCode;

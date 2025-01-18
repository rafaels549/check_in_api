const User = require('./User');
const Estabilishment = require('./Estabilishment');
const Product = require('./Product');
const CheckIn = require('./Check_in');
const QrCode = require('./QrCode');

function setupAssociations() {
  // Relacionamentos de User
  User.hasMany(Estabilishment, {
    foreignKey: 'user_id',
    as: 'establishments',
  });
  Estabilishment.belongsTo(User);

  User.hasMany(Product, {
    foreignKey: 'ownerId',
    as: 'products',
  });
  Product.belongsTo(User);

  User.hasMany(CheckIn, {
    foreignKey: 'user_id',
    as: 'check_ins',
  });
  CheckIn.belongsTo(User);

  // Relacionamentos de Estabilishment
  Estabilishment.hasMany(CheckIn, {
    foreignKey: 'establishment_id',
    as: 'check_ins',
  });
  CheckIn.belongsTo(Estabilishment);

  Estabilishment.hasMany(Product, {
    foreignKey: 'ownerId',
    as: 'products',
  });
  Product.belongsTo(Estabilishment);

  Estabilishment.hasMany(QrCode, {
    foreignKey: 'estabilishment_id',
    as: 'qrCodes',
  });
  QrCode.belongsTo(Estabilishment);
}

module.exports = setupAssociations;

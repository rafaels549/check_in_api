const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");


const CheckIn = sequelize.define("check_in",{
   user_id:{
     type:DataTypes.INTEGER,
     allowNull:false,
     references: {
        model:User,
        key:"id"
     },
    onDelete:"CASCADE"
   },
   establishment_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: 'Estabilishments',
        key: 'id',
    },
    onDelete: 'CASCADE',
},
active:{
    type:DataTypes.BOOLEAN,
    allowNull:false,
    defaultValue:true
}

})
/* User.hasMany(CheckIn, { foreignKey: "user_id", as: "check_ins" }); 
CheckIn.belongsTo(User);

Estabilishment.hasMany(CheckIn, { foreignKey: "establishment_id", as: "check_ins" });
CheckIn.belongsTo(Estabilishment);  */

module.exports = CheckIn;

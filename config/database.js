const { Sequelize } = require('sequelize');


const sequelize = new Sequelize('check_in', 'postgres', 'afklol57', {
  host: 'localhost',
  dialect: 'postgres', 
});
async function testConnection() {
    try {
      await sequelize.authenticate(); 
      console.log('Conexão com o banco de dados foi bem-sucedida!');
    } catch (error) {
      console.error('Não foi possível conectar ao banco de dados:', error);
    }
  }
  

  testConnection();
module.exports = sequelize;
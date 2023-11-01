const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('mediar', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306, 
});

sequelize.authenticate()
  .then(() => {
    console.log('\n ----- Veritabanı bağlantısı başarılı. -----');
  })
  .catch((error) => {
    console.error('\n ----- Veritabanı bağlantısı başarısız:', error);
  });

module.exports = sequelize;

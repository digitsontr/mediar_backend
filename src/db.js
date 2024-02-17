const { Sequelize } = require("sequelize");
import config from "../configLoader";

const sequelize = new Sequelize(config.dbConnection.dbName, config.dbConnection.username, config.dbConnection.password, {
  host: config.dbConnection.host,
  dialect: config.dbConnection.dialect,
  port: config.dbConnection.port,
});

sequelize
  .authenticate()
  .then(() => {
    console.log("\n ----- Veritabanı bağlantısı başarılı. -----");
  })
  .catch((error) => {
    console.error("\n ----- Veritabanı bağlantısı başarısız:", error);
  });

module.exports = sequelize;

// models/log.js
const {
  DataTypes
} = require("sequelize");
const sequelize = require("../db");
const Log = sequelize.define("Log", {
  user: {
    type: DataTypes.STRING,
    allowNull: false
  },
  process: {
    type: DataTypes.STRING,
    allowNull: false
  },
  datetime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});
module.exports = Log;
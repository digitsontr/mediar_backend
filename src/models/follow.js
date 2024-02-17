// follow.js
const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const User = require("./user");

const Follow = sequelize.define("Follow", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  followingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'Follow', // Burada veritabanındaki gerçek tablo adını belirtin
});

// İlişkileri tanımlama
Follow.belongsTo(User, { foreignKey: 'followerId', as: 'followerUser' });
Follow.belongsTo(User, { foreignKey: 'followingId', as: 'followingUser' });


module.exports = Follow;

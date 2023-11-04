const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Sequelize bağlantınızı burada tanımlayın

const Article = require('./article');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // E-postaların benzersiz olmasını sağlar
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: ""
  },
  birthday: {
    type: DataTypes.DATE,
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Varsayılan değeri false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // Varsayılan değeri true
  },
});

User.hasMany(Article, { foreignKey: 'authorId', as: 'articles' });
// user.js
User.belongsToMany(User, { as: 'Followers', foreignKey: 'followingId', through: 'Follow' });
User.belongsToMany(User, { as: 'Following', foreignKey: 'followerId', through: 'Follow' });
User.belongsToMany(Article, {
  through: 'LikedShares',
  as: 'LikedArticles', // Burada "LikedArticles" bir takma ad (alias) olarak kullanılıyor
  foreignKey: 'userId',
});


module.exports = User;

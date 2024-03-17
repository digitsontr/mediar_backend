// Article.js (MySQL)
const {
  DataTypes
} = require("sequelize");
const sequelize = require("../db"); // Sequelize bağlantınızı burada tanımlayın

const Article = sequelize.define("Article", {
  content: {
    type: DataTypes.STRING,
    allowNull: false
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  point: {
    type: DataTypes.INTEGER,
    defaultValue: 0 // Default değeri 0 olarak ayarlandı
  },
  created_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});
Article.associate = models => {
  Article.belongsToMany(models.User, {
    through: 'LikedShares',
    as: 'likedUsers'
  });
  Article.belongsTo(models.User, {
    foreignKey: 'authorId',
    as: 'author'
  });
};
module.exports = Article;
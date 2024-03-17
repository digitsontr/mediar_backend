const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Article = require("../models/article");
const User = require("../models/user");

const LikedShares = sequelize.define("LikedShares", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "User",
      key: "id",
    },
  },
  articleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Article",
      key: "id",
    },
  },
});

User.belongsToMany(Article, {
  through: LikedShares,
  as: "likedArticles",
  foreignKey: "userId",
});
Article.belongsToMany(User, {
  through: LikedShares,
  as: "likedUsers",
  foreignKey: "articleId",
});

module.exports = LikedShares;

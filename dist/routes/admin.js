// src/routes/articles.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const {
  adminTokenControl
} = require("../services/jwtService");
const Article = require("../models/article");
const User = require("../models/user");
const Log = require("../models/log");
const Notification = require("../models/notification");
const {
  getIO
} = require("../../socket");
const io = getIO();
const logService = require("../services/logService");
router.delete("/deleteUser", adminTokenControl, upload.none(), async (req, res) => {
  try {
    const userId = req.body.userId;
    const user = await User.findOne({
      where: {
        id: userId
      } // Kullanıcı idsine göre arama yapmak için where alanı ekleyin
    });
    if (!user) {
      return res.status(404).json({
        message: "Kullanıcı admin tarafından bulunamadı."
      });
    }
    await user.destroy();
    res.status(200).end();
    logService.createLog(userId, "Kullanıcı admin tarafından silindi.");
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});
router.get("/articles", adminTokenControl, upload.none(), async (req, res) => {
  try {
    const articles = await Article.findAll();
    for (const article of articles) {
      const author = await User.findByPk(article.authorId);
      article.dataValues.authorName = author.username;
      const likedUsers = await article.getLikedUsers({
        attributes: {
          exclude: ["password"] // Exclude the password field
        }
      });
      article.dataValues.likedUsers = likedUsers;
    }
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});
router.get("/logs", adminTokenControl, upload.none(), async (req, res) => {
  try {
    const logs = await Log.findAll();
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});
router.get("/users", adminTokenControl, upload.none(), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ["password", "isAdmin"] // Exclude the password field
      },
      include: [{
        model: User,
        as: "Followers",
        through: "Follow",
        attributes: {
          exclude: ["password", "isAdmin"] // Exclude the password field
        },
        include: [{
          model: Article,
          as: "LikedArticles",
          through: "LikedShares"
        }]
      },
      // Takipçiler
      {
        model: User,
        as: "Following",
        through: "Follow",
        attributes: {
          exclude: ["password", "isAdmin"] // Exclude the password field
        },
        include: [{
          model: Article,
          as: "LikedArticles",
          through: "LikedShares"
        }]
      },
      // Takip Edilenler
      {
        model: Article,
        as: "LikedArticles",
        through: "LikedShares" // Beğenilen makaleler
      }, "articles" // Kullanıcının makaleleri
      ]
    });
    res.status(200).json(users);
  } catch (error) {
    //console.log("ADMIN/error : ", error.message);

    res.status(500).json({
      error: error.message
    });
  }
});
router.put("/sendNotification", adminTokenControl, upload.none(), async (req, res) => {
  try {
    //console.log("\n\nsendNotification running ");

    const userId = req.body.userId;
    const adminMessage = req.body.adminMessage;
    console.log("\n_SOCKET6: user id : ", userId, typeof userId);
    console.log("user adminMessage : ", adminMessage);
    const user = await User.findOne({
      where: {
        id: userId
      } // Kullanıcı idsine göre arama yapmak için where alanı ekleyin
    });
    const notification = await Notification.create({
      message: "MEDIATLON " + adminMessage,
      userId: userId,
      time: new Date()
    });
    io.to(userId.toString()).emit("new_notification", {
      notification
    });
    logService.createLog(user.username, "Kullanıcıya admin tarafından bildirim gönderildi : " + notification.message);
    console.log("\n\n_SOCKET4: sendNotification ended");
    res.status(200).end();
  } catch (error) {
    console.log("\n\n_SOCKET5: ADMIN_notification/ERROR5 : ", error.message);
    res.status(500).json({
      error: error.message
    });
  }
});
module.exports = router;
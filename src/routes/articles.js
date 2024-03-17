// src/routes/articles.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();
const logService = require("../services/logService");
const { tokenControl } = require("../services/jwtService");
const Article = require("../models/article");
const User = require("../models/user");
const LikedShares = require("../models/likedShares");
const Notification = require("../models/notification");
const { Op } = require("sequelize");

const socket = require("../../socket");
const io = socket.getIO();

router.get("/myfollowings", tokenControl, upload.none(), async (req, res) => {
  try {
    const userId = req._userId;

    // Önce kullanıcının takip ettiği kişilerin listesini alın
    const user = await User.findByPk(userId, {
      include: [
        {
          model: User,
          as: "Following",
          attributes: ["id"], // Sadece id'leri almak yeterli
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    // Takip ettiğiniz kullanıcıların id'lerini bir diziye çıkartın
    const followingIds = user.Following.map((following) => following.id);

    // Bu kullanıcıların makalelerini alın
    const articles = await Article.findAll({
      where: {
        authorId: {
          [Op.in]: followingIds, // Takip ettiğiniz kullanıcıların id'leri ile filtreleme
        },
      },
      include: [
        {
          model: User,
          as: "likedUsers",
          attributes: ["id", "username"],
          through: {
            attributes: [], // İlişkisel tablodan veri getirmeyi engelleyin
          },
        },
      ],
    });

    // Makaleleri ve yazar bilgilerini döndür
    const articlesWithAuthor = await Promise.all(
      articles.map(async (article) => {
        // Her makalenin yazarını bul
        const author = await User.findByPk(article.authorId, {
          attributes: ["username", "image"], // Yazarın kullanıcı adı ve resmini al
        });

        return {
          ...article.get({ plain: true }),
          authorName: author.username, // Yazarın kullanıcı adını ekle
          authorImage: author.image, // Yazarın kullanıcı adını ekle
        };
      })
    );

    //console.log("ARTICLES : ", articlesWithAuthor);

    res.status(200).json(articlesWithAuthor);
  } catch (error) {
    //console.log("Error on /myfollows endpoint: ", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get(
  "/mynonfollowings",
  tokenControl,
  upload.none(),
  async (req, res) => {
    try {
      const userId = req._userId;

      // Kullanıcının takip ettiği kişilerin listesini alın
      const user = await User.findByPk(userId, {
        include: [
          {
            model: User,
            as: "Following",
            attributes: ["id"],
          },
        ],
      });

      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı." });
      }

      // Takip ettiğiniz kullanıcıların id'lerini bir diziye çıkartın
      const followingIds = user.Following.map((following) => following.id);

      // Bu id'lerin dışında kalan yazarların makalelerini alın
      const articles = await Article.findAll({
        where: {
          authorId: {
            [Op.notIn]: followingIds, // Takip ettiğiniz kullanıcıların dışındakiler
          },
          [Op.not]: {
            authorId: userId, // Kullanıcının kendi makalelerini de dışarda bırak
          },
        },
        include: [
          {
            model: User,
            as: "likedUsers",
            attributes: ["id", "username"],
            through: {
              attributes: [],
            },
          },
        ],
      });

      const articlesWithAuthor = await Promise.all(
        articles.map(async (article) => {
          // Her makalenin yazarını bul
          const author = await User.findByPk(article.authorId, {
            attributes: ["username", "image"], // Yazarın kullanıcı adı ve resmini al
          });

          return {
            ...article.get({ plain: true }),
            authorName: author.username, // Yazarın kullanıcı adını ekle
            authorImage: author.image, // Yazarın kullanıcı adını ekle
          };
        })
      );

      //console.log("ARTICLES : ", articlesWithAuthor);

      res.status(200).json(articlesWithAuthor);
    } catch (error) {
      //console.log("Error on /nonfollowings endpoint: ", error.message);
      res.status(500).json({ error: error.message });
    }
  }
);

router.get("/", tokenControl, upload.none(), async (req, res) => {
  try {
    //console.log("XXXXXXXXXXXXX1");
    const userId = req._userId;

    // Kullanıcıya ait olmayan makaleleri doğrudan al
    const articles = await Article.findAll({
      where: {
        authorId: {
          [Op.ne]: userId, // Op.ne, 'not equal' (eşit değil) anlamına gelir
        },
      },
    });

    for (const article of articles) {
      const author = await User.findByPk(article.authorId);

      article.dataValues.authorName = author.username;

      const likedUsers = await article.getLikedUsers({
        attributes: {
          exclude: ["password"], // Exclude the password field
        },
      });
      article.dataValues.likedUsers = likedUsers;
    }

    //console.log("0000000000");
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kullanıcının makaleleri, makaleleri beğenenlerle birlikte
router.get("/self/", tokenControl, upload.none(), async (req, res) => {
  var userId = req._userId;

  try {
    //console.log("XXXXXXXXXXXXX1");

    const articles = await Article.findAll({
      where: {
        authorId: userId,
      },
    });

    for (const article of articles) {
      const author = await User.findByPk(article.authorId);

      article.dataValues.authorName = author.username;
      article.dataValues.authorImage = author.image;

      const likedUsers = await article.getLikedUsers({
        attributes: {
          exclude: ["password"],
        },
      });

      article.dataValues.likedUsers = likedUsers;
    }

    res.status(200).json(articles);
  } catch (error) {
    //console.log("error : ", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get(
  "/ofUser/:authorid",
  tokenControl,
  upload.none(),
  async (req, res) => {
    //console.log("authorId xx : ", req.params.authorid);

    var userId = req.params.authorid;

    if (req.params.authorid != "") {
      userId = req.params.authorid;
    }

    try {
      //console.log("XXXXXXXXXXXXX1");

      const articles = await Article.findAll({
        where: {
          authorId: userId,
        },
      });

      for (const article of articles) {
        const author = await User.findByPk(article.authorId);
        article.dataValues.authorName = author.username;

        const likedUsers = await article.getLikedUsers({
          attributes: {
            exclude: ["password"],
          },
        });

        article.dataValues.likedUsers = likedUsers;
      }

      res.status(200).json(articles);
    } catch (error) {
      //console.log("error : ", error.message);
      res.status(500).json({ error: error.message });
    }
  }
);

// TODO : Henüz tamamlanmadı
/*
router.get("/recommendedArticles", tokenControl, upload.none(), async (req, res) => {
  try {
    const userId = req._userId;

    // Kullanıcının takip ettiklerini bulun
    const user = await User.findByPk(userId, {
      include: [
        {
          model: User,
          as: "Following",
          through: "Follow",
          attributes: ["id", "username", "image", "email", "name"], // Takip ettiklerin belirli alanlarını seçebilirsiniz
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    //console.log("FOLLOWINGS : ", user.Following[0].id);

    const followingUsers = user.Following;

    console.log("followingUsers : ", followingUsers);


    // Takip ettiğiniz kullanıcıların beğendiği makaleleri alın
    let likedArticles = [];

    console.log("followingUsers.Following : ", followingUsers.Follow);

    followingUsers.Follow.forEach(followingUser => {
      likedArticles = [...likedArticles, ...followingUser.LikedArticles];
    });

    console.log("likedArticles : ", likedArticles);

    // Siz tarafından takip edilmeyen yazarların makalelerini filtreleyin
    const notFollowedAuthorsArticles = likedArticles.filter(article => {
      return !followingUsers.Following.some(followingUser => followingUser.id === article.authorId);
    });

    console.log("notFollowedAuthorsArticles : ", notFollowedAuthorsArticles);

    // Yazarları takip etmediğiniz makaleleri döndür
    res.status(200).json(notFollowedAuthorsArticles);

  } catch (error) {
    console.error("Error in /recommendedArticles: ", error);
    res.status(500).json({ error: error.message });
  }
});
*/

// Makale bilgisi
router.get("/:id", tokenControl, upload.none(), async (req, res) => {
  try {
    //console.log("XXXXXXXXXXXXX2");

    const articleId = req.params.id;

    // Makaleyi bulun
    const article = await Article.findByPk(articleId);

    if (!article) {
      return res.status(404).json({ message: "Makale bulunamadı." });
    }

    const likedUsers = await article.getLikedUsers({
      attributes: { exclude: ["password"] },
    });

    res.status(200).json({ article, likedUsers });
  } catch (error) {
    //console.log("ARTICLES/error : ", error.message);

    res.status(400).json({ error: "ERROR1" });
  }
});

// Makale paylaşma
router.post("/shareArticle", tokenControl, upload.none(), async (req, res) => {
  try {
    //console.log("XXXXXXXXXXXXX3");

    const authorId = req._userId;
    const content = req.body.content;

    const article = new Article({ content, authorId });
    await article.save();

    res.status(200).json({ message: "Makale başarıyla paylaşıldı." });

    const user = await User.findByPk(authorId);

    logService.createLog(user.username, "Kullanıcı yeni makale paylaştı.");
  } catch (error) {
    //console.log("ARTICLES/error : ", error.message);

    res.status(500).json({ error: error.message });
  }
});

router.put(
  "/updateArticle/:id",
  tokenControl,
  upload.none(),
  async (req, res) => {
    try {
      //console.log("XXXXXXXXXXXXX4");

      const articleId = req.params.id;
      const userId = req._userId;
      const { content } = req.body; // Kullanıcının kimliğini talep gövdesinden alın

      // Makaleyi bulun
      const article = await Article.findByPk(articleId);

      if (!article) {
        return res.status(404).json({ message: "Makale bulunamadı." });
      }

      // Makaleyi güncellemeye çalışmadan önce, kullanıcının makalenin sahibi olduğunu kontrol edin
      if (article.authorId != userId) {
        return res
          .status(403)
          .json({ message: "Bu makaleyi güncellemeye yetkiniz yok." });
      }

      // Eğer kullanıcı makalenin sahibiyse, makaleyi güncelleyin
      await Article.update({ content }, { where: { id: articleId } });

      // Güncellenmiş makaleyi almak için bir kez daha sorgulama yapın
      const updatedArticle = await Article.findByPk(articleId);

      res.status(200).json({ message: "Makale güncellendi.", updatedArticle });

      const user = await User.findByPk(authorId);

      logService.createLog(user.username, "Kullanıcı makalesini güncelledi.");
    } catch (error) {
      //console.log("ARTICLES/error : ", error.message);

      res.status(500).json({ error: error.message });
    }
  }
);

// Makale silme
router.delete(
  "/deleteArticle/:id",
  tokenControl,
  upload.none(),
  async (req, res) => {
    try {
      //console.log("XXXXXXXXXXXXX5");

      const articleId = req.params.id;
      const userId = req._userId; // Kullanıcının kimliğini talep gövdesinden alın

      // Makaleyi bulun
      const article = await Article.findByPk(articleId);

      if (!article) {
        return res.status(404).json({ message: "Makale bulunamadı." });
      }

      // Makaleyi silmeden önce, kullanıcının makalenin sahibi olduğunu kontrol edin
      if (article.authorId != userId) {
        return res
          .status(403)
          .json({ message: "Bu makaleyi silmeye yetkiniz yok." });
      }

      // Eğer kullanıcı makalenin sahibiyse, makaleyi silin
      await Article.destroy({
        where: { id: articleId },
      });

      res.status(200).end();

      const user = await User.findByPk(article.authorId);

      logService.createLog(user.username, "Kullanıcı makalesini sildi.");
    } catch (error) {
      //console.log("ARTICLES/error : ", error.message);

      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/likeArticle/:id",
  tokenControl,
  upload.none(),
  async (req, res) => {
    try {
      //console.log("XXXXXXXXXXXXX6");

      const articleId = req.params.id;
      const userId = req._userId;

      // Makalenin yazarını al
      const article = await Article.findByPk(articleId);
      if (!article) {
        return res.status(404).json({ message: "Makale bulunamadı." });
      }

      /*
      console.log(
        "AUTHOR ID : ",
        article.authorId,
        " - Type : ",
        typeof article.authorId
      );
      console.log("USER ID : ", userId, " - Type : ", typeof userId);

      */

      // Kullanıcının kendi makalesini beğenmeye çalışmasını engelle
      if (article.authorId == userId) {
        return res
          .status(400)
          .json({ message: "Kendi makalenizi beğenemezsiniz." });
      }

      const user = await User.findByPk(userId);
      const author = await User.findByPk(article.authorId);

      if (!user) {
        return res.status(404).json({ message: "Kullanıcı bulunamadı." });
      }

      // Makalenin puanını artır
      await article.increment("point", { by: 1 });

      const likedShares = await LikedShares.create({
        userId,
        articleId,
      });

      if (likedShares) {
        const notification = await Notification.create({
          message: `${user.username} likes ${author.username}'s post`,
          userId: author.id,
          time: new Date(),
        });

        io.to(author.id.toString()).emit("new_notification", { notification });

        res.status(200).json({ message: "Makale beğenildi." });

        logService.createLog(
          user.username,
          "Kullanıcı " + articleId + " id li makaleyi beğendi."
        );
      } else {
        res.status(500).json({ message: "Makale beğenirken bir hata oluştu." });
      }
    } catch (error) {
      //console.log("ARTICLES/error : ", error.message);

      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  "/unlikeArticle/:id",
  tokenControl,
  upload.none(),
  async (req, res) => {
    try {
      //console.log("XXXXXXXXXXXXX6");

      const articleId = req.params.id;
      const userId = req._userId;

      //console.log("ARTICLES/articleId : ", articleId);
      //console.log("ARTICLES/userId : ", userId);

      // İlgili "LikedShares" kaydını bul ve sil
      const likedShares = await LikedShares.findOne({
        where: {
          userId,
          articleId,
        },
      });

      if (!likedShares) {
        return res.status(404).json({ message: "Beğeni bulunamadı." });
      }

      await likedShares.destroy();

      res.status(200).json({ message: "Makale beğenisi kaldırıldı." });

      const user = await User.findByPk(userId);

      logService.createLog(
        user.username,
        "Kullanıcı " + articleId + " id li makaledeki beğenisini kaldırdı."
      );
    } catch (error) {
      //console.log("ARTICLES/error : ", error.message);

      res.status(500).json({ error: error.message });
    }
  }
);

// Makaleyi beğenen kullanıcılar
router.get("/likedUsers/:id", upload.none(), async (req, res) => {
  try {
    //console.log("XXXXXXXXXXXXX7");

    const articleId = req.params.id;

    // Article modeline ekstra ilişki eklenmesi gerekebilir.
    const article = await Article.findByPk(articleId, {
      include: [{ model: User, as: "likedUsers" }],
    });

    if (!article) {
      return res.status(404).json({ message: "Makale bulunamadı." });
    }

    const likedUsers = article.likedUsers;
    res.status(200).json({ likedUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// src/routes/auth.js
const express = require("express");
const multer = require("multer");
const {
  generateToken,
  tokenControl
} = require("../services/jwtService");
const passport = require("passport");
//const session = require("express-session");

const router = express.Router();
const bcrypt = require("bcrypt");
const upload = multer();
const logService = require("../services/logService");
const User = require("../models/user");
const Follow = require("../models/follow");
const Article = require("../models/article");
const Notification = require("../models/notification");
const socket = require("../../socket");
const io = socket.getIO();

// -----------------------------------------
// google mail oauth2
var GoogleStrategy = require("passport-google-oauth2").Strategy;
require("dotenv").config();
const GOOGLE_CLIENT_ID = process.env["GOOGLE_CLIENT_ID"];
const GOOGLE_CLIENT_SECRET = process.env["GOOGLE_CLIENT_SECRET"];

//console.log("GOOGLE_CLIENT_ID : ", GOOGLE_CLIENT_ID);
//console.log("GOOGLE_CLIENT_SECRET : ", GOOGLE_CLIENT_SECRET);

passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback",
  passReqToCallback: true
}, function (request, accessToken, refreshToken, profile, done) {
  done(null, profile);
}));
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});
router.get("/notifications", tokenControl, upload.none(), async (req, res) => {
  try {
    const userId = req._userId;
    const notifications = await Notification.findAll({
      where: {
        userId: userId
      }
    });

    //console.log("NOTIFICATIONS : ", notifications);

    res.status(200).json(notifications);
  } catch (error) {
    //console.log("AUTH/NOTIFICATIONS/error : ", error.message);

    res.status(500).json({
      error: error.message
    });
  }
});
router.get("/google", passport.authenticate("google", {
  scope: ["email", "profile"]
}));
router.get("/google/callback", passport.authenticate("google", {
  failureRedirect: "/auth/google/failure"
}), async (req, res) => {
  // Google'dan dönen kullanıcı bilgileri
  const googleUser = req.user;

  //console.log("GOOGLE user : ", googleUser);

  try {
    // E-posta adresine göre kullanıcıyı bul veya yeni bir kullanıcı oluştur
    let user = await User.findOne({
      where: {
        email: googleUser.email
      }
    });
    if (!user) {
      // Yeni kullanıcı oluştur
      user = await User.create({
        username: (googleUser.displayNameusername || googleUser.email.split("@")[0]).toLowerCase().replace(" ", ""),
        name: googleUser.displayName,
        email: googleUser.email,
        password: "" // Şifre boş bırakılır çünkü Google OAuth kullanılarak giriş yapılıyor
      });
    }

    // Kullanıcı için JWT token oluştur
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      image: googleUser.picture
    };

    //console.log("PAYLOAD : ", payload);

    const token = generateToken(payload);

    // Token ile yanıt dön
    res.redirect(`http://localhost:3002/google_login_success?token=${token}&userData=${JSON.stringify(payload)}`);
    logService.createLog(user.username, user.username + " Giriş yaptı.");

    //res.status(200).json({ message: 'Giriş başarılı.', token: token, user: user });
  } catch (error) {
    //console.error("Google callback error:", error);
    res.status(500).json({
      error: error.message
    });
  }
});

// -----------------------------------------

// -----------------------------------------

router.post("/login", upload.none(), async (req, res) => {
  try {
    const {
      username,
      password
    } = req.body;
    //console.log("username : ", username, " \n password : ", password);
    const user = await User.findOne({
      where: {
        username: username
      }
    });
    if (!user) {
      return res.status(404).json({
        message: "Kullanıcı bulunamadı."
      });
    }

    //console.log("PASSMATCH FOR LOGIN : ", password, user.password);

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      //console.log("PASSMATCH FOR LOGIN2 : ", passwordMatch);

      const payload = {
        id: user.id,
        username: user.username
      };
      const token = generateToken(payload);

      //console.log("TOKEN : " + token);
      res.status(200).json({
        message: "Giriş başarılı.",
        token: token,
        user: user
      });
      logService.createLog(username, "Giriş yaptı.");
    } else {
      //console.log("PASSMATCH FOR LOGIN3 : ", passwordMatch);

      res.status(401).json({
        message: "Kullanıcı adı veya şifre hatalı."
      });
      logService.createLog(username, "Başarısız giriş.");
    }
  } catch (error) {
    //console.log("ERROR FOR LOGIN : ", error.message);

    res.status(500).json({
      error: error.message
    });
  }
});
router.post("/register", upload.none(), async (req, res) => {
  try {
    const {
      username,
      name,
      email,
      password
    } = req.body;

    /*
    console.log("AUTH/username : ", username);
    console.log("AUTH/name : ", name);
    console.log("AUTH/email : ", email);
    console.log("AUTH/password : ", password);
    */

    const hashedPassword = await bcrypt.hash(password, 10);

    //console.log("AUTH/hashedPassword : ", hashedPassword);

    const user = new User({
      username,
      name,
      email,
      password: hashedPassword
    });
    await user.save();
    res.status(200).json({
      message: "Kullanıcı başarıyla kaydedildi."
    });
    logService.createLog(username, "Kullanıcı başarıyla kaydedildi.");
  } catch (error) {
    //console.log("AUTH/ERROR2 : ", error.message);
    res.status(500).json({
      error: error.message
    });
  }
});
router.get("/followers/", tokenControl, upload.none(), async (req, res) => {
  try {
    const userId = req._userId;

    // Kullanıcının takipçilerini bulun
    const user = await User.findByPk(userId, {
      include: [{
        model: User,
        as: "Followers",
        through: "Follow",
        attributes: ["id", "username", "image", "email", "name"] // Takipçilerin belirli alanlarını seçebilirsiniz
      }]
    });
    if (!user) {
      return res.status(404).json({
        message: "Kullanıcı bulunamadı."
      });
    }

    // o seni takip ediyor, aynı zamanda sen de onu takip ediyor musun?
    const followersWithFollowBack = await Promise.all(user.Followers.map(async follower => {
      const isFollowing = await Follow.findOne({
        where: {
          followerId: userId,
          followingId: follower.id
        }
      });

      //console.log("xxxxx : ", follower.id, " - ", userId, " - ", !!isFollowingBack); // Bu satırı ekleyin

      return {
        ...follower.get(),
        isFollowing: !!isFollowing
      };
    }));
    res.status(200).json({
      followers: followersWithFollowBack
    });

    //const followers = user.Followers; // Kullanıcının takipçileri "Followers" ilişkisi aracılığıyla alınır
    //res.status(200).json({ followers });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});
router.get("/followings/", tokenControl, upload.none(), async (req, res) => {
  try {
    const userId = req._userId;

    // Kullanıcının takip ettiklerini bulun
    const user = await User.findByPk(userId, {
      include: [{
        model: User,
        as: "Following",
        through: "Follow",
        attributes: ["id", "username", "image", "email", "name"] // Takip ettiklerin belirli alanlarını seçebilirsiniz
      }]
    });
    if (!user) {
      return res.status(404).json({
        message: "Kullanıcı bulunamadı."
      });
    }

    //console.log("\n\n\nFOLLOWINGS FOR PROFILE: ", user.Following);

    const followings = user.Following.map(followedUser => ({
      ...followedUser.toJSON(),
      isFollowing: true
    }));

    //console.log("\n\n\ resultFollowings FOR PROFILE: ", resultFollowings);

    res.status(200).json({
      followings
    });
  } catch (error) {
    //console.log("ERROR3 ON FOLLOWINGS : ", error.message);
    res.status(500).json({
      error: error.message
    });
  }
});
router.get("/users", tokenControl, upload.none(), async (req, res) => {
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
    //console.log("AUTH/error : ", error.message);

    res.status(500).json({
      error: error.message
    });
  }
});
router.get("/test", upload.none(), async (req, res) => {
  //console.log("S2S2S2S2S2S2S2S2");
  res.status(200).send("Hello world");
});
router.get("/:id", tokenControl, upload.none(), async (req, res) => {
  try {
    const userForMe = await User.findByPk(req._userId, {
      attributes: {
        exclude: ["password", "isAdmin"]
      },
      include: [{
        model: User,
        as: "Followers",
        through: "Follow",
        attributes: {
          exclude: ["password", "isAdmin"]
        }
      }, {
        model: User,
        as: "Following",
        through: "Follow",
        attributes: {
          exclude: ["password", "isAdmin"]
        }
      }, {
        model: Article,
        as: "articles",
        include: [{
          model: User,
          as: "likedUsers",
          attributes: ["id", "username"],
          through: {
            attributes: []
          }
        }]
      }]
    });
    const userId = req.params.id;
    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ["password", "isAdmin"]
      },
      include: [{
        model: User,
        as: "Followers",
        through: "Follow",
        attributes: {
          exclude: ["password", "isAdmin"]
        }
      }, {
        model: User,
        as: "Following",
        through: "Follow",
        attributes: {
          exclude: ["password", "isAdmin"]
        }
      }, {
        model: Article,
        as: "articles",
        include: [{
          model: User,
          as: "likedUsers",
          attributes: ["id", "username"],
          through: {
            attributes: []
          }
        }]
      }]
    });
    if (!user) {
      return res.status(404).json({
        message: "Kullanıcı bulunamadı."
      });
    }
    const isFollowing = user.Followers.some(follower => follower.id === req._userId);
    user.setDataValue("isFollowing", isFollowing);
    const followings = user.Following.map(followedUser => {
      const isFollowing = userForMe.Followers.some(follower => follower.id === followedUser.id);
      followedUser.setDataValue("isFollowing", isFollowing);
      return followedUser;
    });
    const followers = user.Followers.map(follower => {
      const isFollowing = userForMe.Following.some(followedUser => followedUser.id === follower.id);
      follower.setDataValue("isFollowing", isFollowing);
      return follower;
    });
    user.setDataValue("Following", followings);
    user.setDataValue("Followers", followers);

    //console.log("\n\n user.Followers :: ", followers);

    res.status(200).json(user);
  } catch (error) {
    //console.log("AUTH/error : ", error.message);
    res.status(500).json({
      error: error.message
    });
  }
});
router.put("/updateUser", tokenControl, upload.none(), async (req, res) => {
  try {
    const userId = req._userId;
    const {
      username,
      name,
      email,
      image,
      birthday,
      password
    } = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        message: "Kullanıcı bulunamadı."
      });
    }
    if (req.body.isAdmin || req.body.isActive) {
      return res.status(403).json({
        message: "isAdmin veya isActive alanlarını güncellemeye yetkiniz yok."
      });
    }
    const updatedData = {};
    if (username) {
      updatedData.username = username;
    }
    if (name) {
      updatedData.name = name;
    }
    if (email) {
      updatedData.email = email;
    }
    if (image) {
      updatedData.image = image;
    }
    if (birthday) {
      updatedData.birthday = birthday;
    }
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }
    await User.update(updatedData, {
      where: {
        id: userId
      }
    });
    const updatedUser = await User.findByPk(userId);
    res.status(200).json({
      message: "Kullanıcı bilgileri güncellendi.",
      updatedUser
    });
    logService.createLog(updatedUser.username, "Kullanıcı bilgileri güncellendi.");
  } catch (error) {
    //console.log("AUTH/ERROR4 : ", error.message);

    res.status(500).json({
      error: error.message
    });
  }
});
router.delete("/deleteUser", tokenControl, upload.none(), async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const user = await User.findOne({
      where: {
        username: username
      } // Kullanıcı adına göre arama yapmak için where alanı ekleyin
    });
    if (!user) {
      return res.status(404).json({
        message: "Kullanıcı bulunamadı."
      });
    }

    // Parola kontrolü
    if (!password) {
      return res.status(400).json({
        message: "Parolanızı girmelisiniz."
      });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        message: "Parola yanlış."
      });
    }
    await user.destroy();
    res.status(204).end();
    logService.createLog(username, "Kullanıcı silindi.");
  } catch (error) {
    //console.log("AUTH/ERROR5 : ", error.message);

    res.status(500).json({
      error: error.message
    });
  }
});
router.get("/likedArticles/:id", tokenControl, upload.none(), async (req, res) => {
  try {
    const userId = req._userId;
    const userLikedsArticles = await User.findByPk(userId, {
      include: [{
        model: Article,
        as: "likedArticles"
      }]
    });
    if (!userLikedsArticles) {
      return res.status(404).json({
        message: "Beğenilen makale bulunamadı."
      });
    }

    //console.log("OOOOOOOOOOOOO");

    const likedArticles = userLikedsArticles.likedArticles || [];
    res.status(200).json({
      likedArticles
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});
router.post("/follow/:id", tokenControl, upload.none(), async (req, res) => {
  try {
    const followerId = req._userId; // Takip eden kullanıcının ID'si
    const followingId = req.params.id; // Takip edilen kullanıcının ID'si

    if (followerId == followingId) {
      return res.status(404).json({
        message: "Kullanıcı kendini takip edemez."
      });
    }

    //console.log("following id : ", followingId);
    // Takip edilen kullanıcıyı bulun
    const followingUser = await User.findByPk(followingId);
    if (!followingUser) {
      return res.status(404).json({
        message: "Takip edilen kullanıcı bulunamadı."
      });
    }

    // Takip eden kullanıcıyı bulun
    const followerUser = await User.findByPk(followerId);
    if (!followerUser) {
      return res.status(404).json({
        message: "Takipçi kullanıcı bulunamadı."
      });
    }

    // Takipçi kullanıcıyı takip edilen kullanıcıyı takip ediyor mu kontrol et
    const isAlreadyFollowing = await followingUser.hasFollower(followerUser);
    if (isAlreadyFollowing) {
      return res.status(400).json({
        message: "Bu kullanıcıyı zaten takip ediyorsunuz."
      });
    }

    // Takip et
    await followingUser.addFollower(followerUser);
    const notification = await Notification.create({
      message: `${followerUser.username} follows ${followingUser.username}`,
      userId: followingUser.id,
      time: new Date()
    });
    io.to(followingId.toString()).emit("new_notification", {
      notification
    });
    res.status(200).json({
      message: "Kullanıcıyı başarıyla takip ettiniz."
    });
    logService.createLog(followerUser.username, followerUser.username + " follows " + followingUser.username);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});
router.post("/unfollow/:id", tokenControl, upload.none(), async (req, res) => {
  try {
    const followerId = req._userId; // Takip eden kullanıcının ID'si
    const followingId = req.params.id; // Takip edilen kullanıcının ID'si

    if (followerId == followingId) {
      return res.status(404).json({
        message: "Kullanıcı kendini takip edemez."
      });
    }

    // Takip edilen kullanıcıyı bulun
    const followingUser = await User.findByPk(followingId);
    if (!followingUser) {
      return res.status(404).json({
        message: "Takip edilen kullanıcı bulunamadı."
      });
    }

    // Takip eden kullanıcıyı bulun
    const followerUser = await User.findByPk(followerId);
    if (!followerUser) {
      return res.status(404).json({
        message: "Takipçi kullanıcı bulunamadı."
      });
    }

    // Takipçi kullanıcıyı takip edilen kullanıcıyı takip ediyor mu kontrol et
    const isAlreadyFollowing = await followingUser.hasFollower(followerUser);
    if (!isAlreadyFollowing) {
      return res.status(400).json({
        message: "Bu kullanıcıyı zaten takip etmiyorsunuz."
      });
    }

    // Takibi bırak
    await followingUser.removeFollower(followerUser);
    await Notification.create({
      message: `${followerUser.username} unfollows ${followingUser.username}`,
      userId: followingUser.id,
      time: new Date()
    });
    res.status(200).json({
      message: "Kullanıcının takibini bıraktınız."
    });
    logService.createLog(followerUser.username, " unfollows " + followingUser.username);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});
router.get("/google/failure", upload.none(), async (req, res) => {
  try {
    //.log("AUTH/FAILURE : Google auth - başarısız.", req);

    res.status(200).json({
      message: "Google auth - başarısız."
    });
  } catch (error) {
    //console.log("AUTH/ERROR6 : ", error.message);
    res.status(500).json({
      error: error.message
    });
  }
});
router.get("/logout", async (req, res) => {
  try {
    req.session.destroy();
    res.send("logout-see you again..");
  } catch (error) {
    res.send("logout-see you again..");
  }
});
module.exports = router;
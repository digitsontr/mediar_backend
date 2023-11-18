// src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const upload = multer();
const logService = require('../services/logService');
const { generateToken, tokenControl } = require('../services/jwtService');
const User = require('../models/user');
const Article = require('../models/article');


router.post('/login', upload.none(), async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("username : ", username, " \n password : ", password);
    const user = await User.findOne({
      where: { username: username }, 
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {

      const payload = { id: user.id, username: user.username };
      const token = generateToken(payload);

      console.log("TOKEN : " + token);
      res.status(200).json({ message: 'Giriş başarılı.', token: token, user: user});

      logService.createLog(username, "Giriş yaptı.");
    } else {
      res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı.' });

      logService.createLog(username, "Başarısız giriş.");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/register', upload.none(), async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    console.log("AUTH/username : ", username);
    console.log("AUTH/name : ", name);
    console.log("AUTH/email : ", email);
    console.log("AUTH/password : ", password);
    
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("AUTH/hashedPassword : ", hashedPassword);

    const user = new User({ username, name, email, password: hashedPassword });

    await user.save();

    res.status(200).json({ message: 'Kullanıcı başarıyla kaydedildi.' });

    logService.createLog(username, "Kullanıcı başarıyla kaydedildi.")
  } catch (error) {
    console.log("AUTH/ERROR : ", error.message);
    res.status(500).json({ error: error.message });
  }
});


router.get('/followers/', tokenControl, upload.none(), async (req, res) => {
  try {
    const userId = req._userId;
    
    // Kullanıcının takipçilerini bulun
    const user = await User.findByPk(userId, {
      include: [
        {
          model: User,
          as: 'Followers',
          through: 'Follow',
          attributes: ['id', 'username', 'image', 'email', 'name'], // Takipçilerin belirli alanlarını seçebilirsiniz
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    const followers = user.Followers; // Kullanıcının takipçileri "Followers" ilişkisi aracılığıyla alınır

    res.status(200).json({ followers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/followings/', tokenControl, upload.none(), async (req, res) => {
  try {
    const userId = req._userId;;
    
    // Kullanıcının takip ettiklerini bulun
    const user = await User.findByPk(userId, {
      include: [
        {
          model: User,
          as: 'Following',
          through: 'Follow',
          attributes: ['id', 'username', 'image', 'email', 'name'], // Takip ettiklerin belirli alanlarını seçebilirsiniz
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    const following = user.Following; // Kullanıcının takip ettikleri "Following" ilişkisi aracılığıyla alınır

    res.status(200).json({ following });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', tokenControl, upload.none(), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: {
        exclude: ['password', 'isAdmin'], // Exclude the password field
      },
      include: [
        { model: User, as: 'Followers', through: 'Follow', 
          attributes: {
            exclude: ['password', 'isAdmin'], // Exclude the password field
          },
          include: [
            {
              model: Article,
              as: 'LikedArticles',
              through: 'LikedShares',
            },
          ],
        }, // Takipçiler
        { model: User, as: 'Following', through: 'Follow', 
          attributes: {
            exclude: ['password', 'isAdmin'], // Exclude the password field
          }, 
          include: [
            {
              model: Article,
              as: 'LikedArticles',
              through: 'LikedShares',
            },
          ],
        }, // Takip Edilenler
        {
          model: Article,
          as: 'LikedArticles',
          through: 'LikedShares', // Beğenilen makaleler
        },
        'articles', // Kullanıcının makaleleri
      ],
    });

    res.status(200).json(users);
  } catch (error) {
    console.log("AUTH/error : ", error.message);

    res.status(500).json({ error: error.message });
  }
});


router.get('/:id', tokenControl, upload.none(), async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'isAdmin'] },
      
      include: [
        { model: User, as: 'Followers', through: 'Follow', 
          attributes: {
            exclude: ['password', 'isAdmin'], // Exclude the password field
          },  
        }, 
        { model: User, as: 'Following', through: 'Follow',
          attributes: {
            exclude: ['password', 'isAdmin'], // Exclude the password field
          },  
        }, 
        {
          model: Article,
          as: 'LikedArticles',
          through: 'LikedShares', 
        },
        'articles', 
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("AUTH/error : ", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.put('/updateUser', tokenControl, upload.none(), async (req, res) => {
  try {
    const userId = req._userId;
    const { username, name, email, image, birthday, password } = req.body;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    if (req.body.isAdmin || req.body.isActive) {
      return res.status(403).json({ message: 'isAdmin veya isActive alanlarını güncellemeye yetkiniz yok.' });
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

    await User.update(updatedData, { where: { id: userId } });

    const updatedUser = await User.findByPk(userId);

    res.status(200).json({ message: 'Kullanıcı bilgileri güncellendi.', updatedUser });

    logService.createLog(updatedUser.username, "Kullanıcı bilgileri güncellendi.");
  } catch (error) {
    console.log("AUTH/ERROR : ", error.message);

    res.status(500).json({ error: error.message });
  }
});

// Kullanıcı silme
router.delete('/deleteUser', tokenControl, upload.none(), async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const user = await User.findOne({
      where: { username: username }, // Kullanıcı adına göre arama yapmak için where alanı ekleyin
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    // Parola kontrolü
    if (!password) {
      return res.status(400).json({ message: 'Parolanızı girmelisiniz.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Parola yanlış.' });
    }

    await user.destroy();

    res.status(204).end();

    logService.createLog(username, "Kullanıcı silindi.");
  } catch (error) {
    console.log("AUTH/ERROR : ", error.message);

    res.status(500).json({ error: error.message });
  }
});

router.get('/likedArticles/:id', tokenControl,  upload.none(), async (req, res) => {
  try {
    const userId = req._userId;
    
    const user = await User.findByPk(userId, {
      include: [{ model: Article, as: 'likedArticles' }],
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    const likedArticles = user.likedArticles;
    
    res.status(200).json({ likedArticles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// auth.js
router.post('/follow/:id', tokenControl, upload.none(), async (req, res) => {
  try {
    const followerId = req._userId; // Takip eden kullanıcının ID'si
    const followingId = req.params.id; // Takip edilen kullanıcının ID'si

    if (followerId == followingId) {
      return res.status(404).json({ message: 'Kullanıcı kendini takip edemez.' });
    } 

    console.log("following id : ", followingId);
    // Takip edilen kullanıcıyı bulun
    const followingUser = await User.findByPk(followingId);

    if (!followingUser) {
      return res.status(404).json({ message: 'Takip edilen kullanıcı bulunamadı.' });
    }

    // Takip eden kullanıcıyı bulun
    const followerUser = await User.findByPk(followerId);

    if (!followerUser) {
      return res.status(404).json({ message: 'Takipçi kullanıcı bulunamadı.' });
    }

    // Takipçi kullanıcıyı takip edilen kullanıcıyı takip ediyor mu kontrol et
    const isAlreadyFollowing = await followingUser.hasFollower(followerUser);

    if (isAlreadyFollowing) {
      return res.status(400).json({ message: 'Bu kullanıcıyı zaten takip ediyorsunuz.' });
    }

    // Takip et
    await followingUser.addFollower(followerUser);

    res.status(200).json({ message: 'Kullanıcıyı başarıyla takip ettiniz.' });

    logService.createLog(followerUser.username, followingUser.username + " kullanıcısı takip edildi.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/unfollow/:id', tokenControl, upload.none(), async (req, res) => {
  try {
    const followerId = req._userId; // Takip eden kullanıcının ID'si
    const followingId = req.params.id; // Takip edilen kullanıcının ID'si

    if (followerId == followingId) {
      return res.status(404).json({ message: 'Kullanıcı kendini takip edemez.' });
    } 

    // Takip edilen kullanıcıyı bulun
    const followingUser = await User.findByPk(followingId);

    if (!followingUser) {
      return res.status(404).json({ message: 'Takip edilen kullanıcı bulunamadı.' });
    }

    // Takip eden kullanıcıyı bulun
    const followerUser = await User.findByPk(followerId);

    if (!followerUser) {
      return res.status(404).json({ message: 'Takipçi kullanıcı bulunamadı.' });
    }

    // Takipçi kullanıcıyı takip edilen kullanıcıyı takip ediyor mu kontrol et
    const isAlreadyFollowing = await followingUser.hasFollower(followerUser);

    if (!isAlreadyFollowing) {
      return res.status(400).json({ message: 'Bu kullanıcıyı zaten takip etmiyorsunuz.' });
    }

    // Takibi bırak
    await followingUser.removeFollower(followerUser);

    res.status(200).json({ message: 'Kullanıcının takibini bıraktınız.' });

    logService.createLog(followerUser.username, followingUser.username + " kullanıcısını takipten çıkardı.");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

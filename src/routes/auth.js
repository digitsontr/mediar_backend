// src/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const multer = require('multer');
const upload = multer();

const User = require('../models/user');
const Article = require('../models/article');

// Kullanıcı kaydı
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
  } catch (error) {
    console.log("AUTH/ERROR : ", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', upload.none(), async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        { model: User, as: 'Followers', through: 'Follow' }, // Takipçiler
        { model: User, as: 'Following', through: 'Follow' }, // Takip Edilenler
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


// user bilgisi
router.get('/:id', upload.none(), async (req, res) => {
  try {
    const userId = req.params.id;

    // Kullanıcıyı bulun
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'isAdmin'] },
      include: [
        { model: User, as: 'Followers', through: 'Follow' }, // Takipçiler
        { model: User, as: 'Following', through: 'Follow' }, // Takip Edilenler
        {
          model: Article,
          as: 'LikedArticles',
          through: 'LikedShares', // Beğenilen makaleler
        },
        'articles', // Kullanıcının makaleleri
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

router.post('/login', upload.none(), async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({
      where: { username: username }, // Kullanıcı adına göre arama yapmak için where alanı ekleyin
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      res.status(200).json({ message: 'Giriş başarılı.' });
    } else {
      res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/updateUser/:id', upload.none(), async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, name, email, image, birthday } = req.body;

    // Kullanıcıyı bulun
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    // isAdmin ve isActive alanlarını kontrol etmeyin
    if (req.body.isAdmin || req.body.isActive) {
      return res.status(403).json({ message: 'isAdmin veya isActive alanlarını güncellemeye yetkiniz yok.' });
    }

    const updatedData = {};

    // Kullanıcıdan gelen verileri güncelleyin
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

    // Kullanıcının bilgilerini güncelleyin
    await User.update(updatedData, { where: { id: userId } });

    // Güncellenmiş kullanıcıyı almak için bir kez daha sorgulama yapın
    const updatedUser = await User.findByPk(userId);

    res.status(200).json({ message: 'Kullanıcı bilgileri güncellendi.', updatedUser });
  } catch (error) {
    console.log("AUTH/ERROR : ", error.message);

    res.status(500).json({ error: error.message });
  }
});


// Kullanıcı silme
// Kullanıcı silme
router.delete('/deleteUser', upload.none(), async (req, res) => {
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
  } catch (error) {
    console.log("AUTH/ERROR : ", error.message);

    res.status(500).json({ error: error.message });
  }
});

router.get('/likedArticles/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
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
router.post('/follow/:id', upload.none(), async (req, res) => {
  try {
    const followerId = req.body.followerId; // Takip eden kullanıcının ID'si
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

    if (isAlreadyFollowing) {
      return res.status(400).json({ message: 'Bu kullanıcıyı zaten takip ediyorsunuz.' });
    }

    // Takip et
    await followingUser.addFollower(followerUser);

    res.status(200).json({ message: 'Kullanıcıyı başarıyla takip ettiniz.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/unfollow/:id', upload.none(), async (req, res) => {
  try {
    const followerId = req.body.followerId; // Takip eden kullanıcının ID'si
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

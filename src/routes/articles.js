// src/routes/articles.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();

const Article = require('../models/article');
const User = require('../models/user');
const LikedShares = require('../models/likedShares');

router.get('/', upload.none(), async (req, res) => {
  try {
    const articles = await Article.findAll();

    for (const article of articles) {
      const likedUsers = await article.getLikedUsers();
      article.dataValues.likedUsers = likedUsers;
    }

    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Makale bilgisi
router.get('/:id', upload.none(), async (req, res) => {
  try {
    const articleId = req.params.id;

    // Makaleyi bulun
    const article = await Article.findByPk(articleId);

    if (!article) {
      return res.status(404).json({ message: 'Makale bulunamadı.' });
    }

    const likedUsers = await article.getLikedUsers({
      attributes: { exclude: ['password'] },
    });

    res.status(200).json({ article, likedUsers });
  } catch (error) {
    console.log("ARTICLES/error : ", error.message);

    res.status(500).json({ error: error.message });
  }
});

// Makale paylaşma
router.post('/shareArticle', upload.none(), async (req, res) => {
  try {
    const { content, authorId } = req.body;
    console.log("ARTICLES/content : ", content);
    console.log("ARTICLES/authorId : ", authorId);

    const article = new Article({ content, authorId });
    await article.save();

    res.status(201).json({ message: 'Makale başarıyla paylaşıldı.' });
  } catch (error) {
    console.log("ARTICLES/error : ", error.message);

    res.status(500).json({ error: error.message });
  }
});

router.put('/updateArticle/:id', upload.none(), async (req, res) => {
  try {
    const articleId = req.params.id;
    const { content, userId } = req.body; // Kullanıcının kimliğini talep gövdesinden alın

    // Makaleyi bulun
    const article = await Article.findByPk(articleId);

    if (!article) {
      return res.status(404).json({ message: 'Makale bulunamadı.' });
    }

    // Makaleyi güncellemeye çalışmadan önce, kullanıcının makalenin sahibi olduğunu kontrol edin
    if (article.authorId != userId) {
      return res.status(403).json({ message: 'Bu makaleyi güncellemeye yetkiniz yok.' });
    }

    // Eğer kullanıcı makalenin sahibiyse, makaleyi güncelleyin
    await Article.update({ content }, { where: { id: articleId } });

    // Güncellenmiş makaleyi almak için bir kez daha sorgulama yapın
    const updatedArticle = await Article.findByPk(articleId);

    res.status(200).json({ message: 'Makale güncellendi.', updatedArticle });
  } catch (error) {
    console.log("ARTICLES/error : ", error.message);

    res.status(500).json({ error: error.message });
  }
});


// Makale silme
router.delete('/deleteArticle/:id', upload.none(), async (req, res) => {
  try {
    const articleId = req.params.id;
    const userId = req.body.userId; // Kullanıcının kimliğini talep gövdesinden alın

    // Makaleyi bulun
    const article = await Article.findByPk(articleId);

    if (!article) {
      return res.status(404).json({ message: 'Makale bulunamadı.' });
    }

    // Makaleyi silmeden önce, kullanıcının makalenin sahibi olduğunu kontrol edin
    if (article.authorId != userId) {
      return res.status(403).json({ message: 'Bu makaleyi silmeye yetkiniz yok.' });
    }

    // Eğer kullanıcı makalenin sahibiyse, makaleyi silin
    await Article.destroy({
      where: { id: articleId },
    });

    res.status(200).end();
  } catch (error) {
    console.log("ARTICLES/error : ", error.message);

    res.status(500).json({ error: error.message });
  }
});


router.post('/likeArticle/:id', upload.none(), async (req, res) => {
  try {
    const articleId = req.params.id;
    const { userId } = req.body;

    // Makalenin yazarını al
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Makale bulunamadı.' });
    }

    // Kullanıcının kendi makalesini beğenmeye çalışmasını engelle
    if (article.authorId == userId) {
      return res.status(400).json({ message: 'Kendi makalenizi beğenemezsiniz.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    // Makalenin puanını artır
    await article.increment('point', { by: 1 });

    const likedShares = await LikedShares.create({
      userId,
      articleId
    });

    if (likedShares) {
      res.status(200).json({ message: 'Makale beğenildi.' });
    } else {
      res.status(500).json({ message: 'Makale beğenirken bir hata oluştu.' });
    }
  } catch (error) {
    console.log("ARTICLES/error : ", error.message);

    res.status(500).json({ error: error.message });
  }
});

router.post('/unlikeArticle/:id', upload.none(), async (req, res) => {
  try {
    const articleId = req.params.id;
    const { userId } = req.body;

    console.log("ARTICLES/articleId : ", articleId);
    console.log("ARTICLES/userId : ", userId);

    // İlgili "LikedShares" kaydını bul ve sil
    const likedShares = await LikedShares.findOne({
      where: {
        userId,
        articleId
      }
    });

    if (!likedShares) {
      return res.status(404).json({ message: 'Beğeni bulunamadı.' });
    }

    await likedShares.destroy();

    res.status(200).json({ message: 'Makale beğenisi kaldırıldı.' });
  } catch (error) {
    console.log("ARTICLES/error : ", error.message);

    res.status(500).json({ error: error.message });
  }
});

// Makaleyi beğenen kullanıcılar
router.get('/likedUsers/:id', async (req, res) => {
  try {
    const articleId = req.params.id;
    
    // Article modeline ekstra ilişki eklenmesi gerekebilir.
    const article = await Article.findByPk(articleId, {
      include: [{ model: User, as: 'likedUsers' }],
    });

    if (!article) {
      return res.status(404).json({ message: 'Makale bulunamadı.' });
    }

    const likedUsers = article.likedUsers;
    res.status(200).json({ likedUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./src/db'); // MySQL bağlantı dosyanızı içe aktarın
const multer = require('multer'); // multer middleware'ini içe aktarın
const upload = multer(); // Multer'i kullanarak `form-data` verilerini işleyin

const app = express();

sequelize.sync().then(() => {
  console.log('\n ----- MySQL veritabanı bağlantısı başarılı. -----');
}).catch((error) => {
  console.error('\n ----- MySQL veritabanı bağlantısı başarısız:', error);
});


// Middleware
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

/*
app.use(upload.none()); // Multer ile `form-data` verilerini işleyin
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Replace with the actual origin of your client app
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
*/

// Routes
const authRoutes = require('./src/routes/auth');
const articlesRoutes = require('./src/routes/articles');

app.use('/auth', authRoutes);
app.use('/articles', articlesRoutes);

app.listen(3000, () => {
  console.log('\n ----- Server started on port 3000 -----');
});

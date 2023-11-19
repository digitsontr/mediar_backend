const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./src/db'); // MySQL bağlantı dosyanızı içe aktarın
const cors = require('cors');
const session = require('express-session');
const app = express();
const passport = require('passport');

sequelize.sync().then(() => {
  console.log('\n ----- MySQL veritabanı bağlantısı başarılı. -----');
}).catch((error) => {
  console.error('\n ----- MySQL veritabanı bağlantısı başarısız:', error);
});

// -----------------------------------------
// Middleware
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // İzin verilen kaynak (örnekteki URL'i değiştirin)
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});
// -----------------------------------------

// -----------------------------------------
// google oauth2
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.use(passport.initialize());
app.use(passport.session());

// -----------------------------------------
// Routes
const authRoutes = require('./src/routes/auth');
const articlesRoutes = require('./src/routes/articles');

app.use(cors());

app.use('/auth', authRoutes);
app.use('/articles', articlesRoutes);

app.listen(3000, () => {
  console.log('\n ----- Server started on port 3000 -----');
});
// -----------------------------------------

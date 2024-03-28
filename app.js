const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./src/db"); // MySQL bağlantı dosyanızı içe aktarın
const cors = require("cors");
const session = require("express-session");
const app = express();
const passport = require("passport");
const http = require("http");

// -----------------------------------------
// SocketIO Setup..
const { initSocket, getIO, setIO } = require("./socket");

const server = http.createServer(app);

initSocket(server);

const io = getIO();

io.on("connection", (socket) => {
  const userId = (socket.handshake.query || {}).userId || ""; // Initialize userId here

  console.log("_SOCKET31 :********* a user connected *********** : ", socket.id, userId);

  if (userId && userId !== "") {
    socket.join(userId);
    //io.to(userId.toString()).emit('mediatlon_socket_connected', { userId }); // test
  
    console.log("_SOCKET32 :********* a user connected *********** : ", socket.id, userId);

    setIO(io);
  }
});

// -----------------------------------------

// -----------------------------------------
// DB Connection
sequelize
  .sync()
  .then(() => {
    console.log("\n ----- MySQL veritabanı bağlantısı başarılı. -----");
  })
  .catch((error) => {
    console.error("\n ----- MySQL veritabanı bağlantısı başarısız:", error);
  });

// -----------------------------------------
// Middleware Setup
try {
  app.use(bodyParser.urlencoded());
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // İzin verilen kaynak (örnekteki URL'i değiştirin)
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    next();
  });
} catch (error) {
  //console.log("Middleware setup error : ", error);
}
// -----------------------------------------

// -----------------------------------------
// Google OAuth2..
app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "mysecret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
app.use(passport.initialize());
app.use(passport.session());
// -----------------------------------------

// -----------------------------------------
// Routes..
const authRoutes = require("./src/routes/auth");
const articlesRoutes = require("./src/routes/articles");
const adminRoutes = require("./src/routes/admin");

const corsOptions = {
  origin: "*", // İzin verilen kaynakları buraya ekleyin, örn: "http://localhost:3002"
  methods: "GET, POST, PUT, DELETE",
};

app.use(cors(corsOptions));
app.use("/auth", authRoutes);
app.use("/articles", articlesRoutes);
app.use("/admin", adminRoutes);
// -----------------------------------------

// -----------------------------------------
// Start Server..
server.listen(80, () => {
  console.log("\n ----- Server started on port 80 -----\n");
});
// -----------------------------------------


module.exports = { io }

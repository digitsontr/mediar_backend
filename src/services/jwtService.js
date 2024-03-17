const jwt = require("jsonwebtoken");

module.exports = {
  // JWT oluşturma

  generateToken(payload, expiresIn = "1h") {
    return jwt.sign(payload, "mediar_security_key", { expiresIn });
  },

  // JWT doğrulama
  verifyToken(token) {
    try {
      //console.log("/token2 : ", token);

      const decoded = jwt.verify(token, "mediar_security_key");

      return decoded;
    } catch (error) {
      return false;
    }
  },

  tokenControl(req, res, next) {
    try {
      var token = req.header("Authorization") || req.body.headers.Authorization;

      //console.log("req :: ", req.body.headers);
      //console.log("token :: ", token);

      if (token && token.startsWith("Bearer ")) {
        token = token.substring(7, token.length);
      } else {
        return res.status(401).json({ error: "Unauthorized" });
      }

      //console.log("/token1 : ", token);

      const decodedToken = module.exports.verifyToken(token);
      //console.log("/decodedToken1 : ", decodedToken);
      //console.log("/decodedToken2 : ", decodedToken["id"]);

      if (decodedToken) {
        //console.log("AAAAAAAAAA");
        req._userId = decodedToken["id"]; // Attach decoded token to the request object

        next(); // Call next to proceed to the route handler
      } else {
        //console.log("BBBBBBBBBB");
        res.status(403).json({ error: "Invalid token" });
      }
    } catch (error) {
      //console.log("ERROR7: ", error);
      res.status(403).json({ error: "Unauthorized request" });
    }
  },

  adminTokenControl(req, res, next) {
    //console.log("LLLLLLLLLLLL adminTokenControl adminTokenControl ", req.header("Authorization"));

    const adminToken = req.header("Authorization")?.split(" ")[1]; // Bearer token
  
    //console.log("\nADMIN TOKEN : ", adminToken);

    if (!adminToken) {
      //console.log("LLLLLLLLLLLL 2222 adminTokenControl adminTokenControl ");

      return res.status(401).json({ error: "Unauthorized" });
    }
  
    try {
      // Admin token'ı doğrulama
      const decodedPayload = jwt.decode(adminToken);

      if (decodedPayload["id"] === "00" && decodedPayload["email"] === "frknyldz8489@gmail.com") {
        //req.adminUser = decodedPayload; // Talebi yapan kullanıcıyı sakla
        next(); // Devam etmek için
      } else {
        return res.status(403).json({ error: "Unauthorized" });
      }
    } catch (error) {
      //console.error("Admin token doğrulanamadı:", error);
      return res.status(403).json({ error: "Unauthorized" });
    }
  }
};

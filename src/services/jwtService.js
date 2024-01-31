const jwt = require("jsonwebtoken");

module.exports = {
  // JWT oluşturma
  generateToken(payload, expiresIn = "1h") {
    return jwt.sign(payload, "mediar_security_key", { expiresIn });
  },

  // JWT doğrulama
  verifyToken(token) {
    try {
      console.log("/token2 : ", token);

      const decoded = jwt.verify(token, "mediar_security_key");

      return decoded;
    } catch (error) {
      return false;
    }
  },

  tokenControl(req, res, next) {
    try {
      var token = req.header("Authorization") || req.body.headers.Authorization;

      console.log("req :: ", req.body.headers);
      console.log("token :: ", token);

      if (token && token.startsWith("Bearer ")) {
        token = token.substring(7, token.length);
      } else {
        return res.status(401).json({ error: "Unauthorized" });
      }

      console.log("/token1 : ", token);

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
      console.log("ERROR: ", error);
      res.status(403).json({ error: "Unauthorized request" });
    }
  },
};

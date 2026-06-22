const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    console.log("========== AUTH MIDDLEWARE STARTED ==========");

    const authHeader = req.headers.authorization || req.headers.Authorization;

    console.log("AUTH HEADER:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("ERROR: No token provided");

      return res.status(401).json({
        error: "Unauthorized - token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED TOKEN:", decoded);

    /*
    IMPORTANT FIX
    */
    req.user = {
      id: decoded.id || decoded.userId,
    };

    console.log("req.user SET:", req.user);

    if (!req.user.id) {
      console.log("ERROR: Invalid token payload");

      return res.status(401).json({
        error: "Unauthorized - invalid token payload",
      });
    }

    next();
  } catch (err) {
    console.log("AUTH ERROR:", err.message);

    return res.status(401).json({
      error: "Unauthorized - invalid or expired token",
    });
  }
};

module.exports = authMiddleware;

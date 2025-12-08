// middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Auth: no token provided");
      return res.status(401).json({ error: "Unauthorized - token missing" });
    }
    const token = authHeader.split(" ")[1];
    // Replace 'YOUR_JWT_SECRET' with your actual JWT secret (store in .env)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id || decoded.userId || null;
    console.log("Auth: decoded userId:", req.userId);
    next();
  } catch (err) {
    console.log("Auth error:", err.message);
    return res.status(401).json({ error: "Unauthorized - invalid token" });
  }
};

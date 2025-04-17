const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("token verify", decoded);
    req.user = decoded; // you can access user info in the next middleware or route
    next();
  } catch (err) {
    return res.status(403).json({ message: err.message });
  }
};

const adminMiddleware = async (req, res, next) => {
  const id = req.user;
  console.log(id);
  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware,
};

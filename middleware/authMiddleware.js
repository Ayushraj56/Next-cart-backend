import { verifyToken } from "../utils/jwt.js";

const isAuthenticated = (req, res, next) => {

  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: "Please login",
    });
  }

  next();
};


export { isAuthenticated };
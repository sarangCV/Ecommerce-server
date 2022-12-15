const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Using global jwt in postman
module.exports = async function (req, res, next) {
  const token = req.header("Authorization").replace("Bearer ", "");
  if (!token) return res.status(401).send("Access denied");

  try {
    const verified = jwt.verify(token, process.env.TOKEN_KEY);
    // req.user = verified;
    const user = await User.findOne({
      _id: verified._id,
    });

    if (!user) throw new Error();

    req.user = user;

    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};

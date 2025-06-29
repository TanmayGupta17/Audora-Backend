const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

function setUser(user) {
  const token = jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    process.env.SECRET,
    {
      expiresIn: "7 days",
    }
  );
  return token;
}

function getUser(token) {
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    console.log(decoded);
    return decoded;
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}

module.exports = {
  setUser,
  getUser,
};

const express = require("express");
const router = express.Router();
const {
  handleUserSignup,
  fetchBooks,
  fetchAllBooks,
  handleFeedback,
  handleUserLogin,
} = require("../controller/user");
const { checkforAuthentication } = require("../middleware/auth");

router.post("/signup", handleUserSignup);
router.post("/login", handleUserLogin);

router.get("/books", fetchAllBooks);
router.get("/books/:id", fetchBooks);
router.post("/feedback", checkforAuthentication, handleFeedback);

module.exports = router;

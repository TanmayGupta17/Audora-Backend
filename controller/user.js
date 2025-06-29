const express = require("express");
const User = require("../models/user");
const ContentItem = require("../models/upload"); // or your actual model file
const Feedback = require("../models/feedback"); // Assuming you have a Feedback model
const { setUser } = require("../services/auth"); // Adjust the path as necessary

const handleUserSignup = async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log("User Already Exist");
    return res.status(409).json({ message: "User already exists" }); // Use a proper status and return!
  }
  await User.create({ name, email, password });
  return res.status(201).json({ message: "User Created Successfully" });
};

const handleUserLogin = async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email: req.body.email });
  if (
    !existingUser ||
    existingUser.googleId ||
    !(await existingUser.comparePassword(req.body.password))
  ) {
    return res
      .status(401)
      .json({ message: "Invalid credentials or account uses Google login" });
  }

  const token = setUser(existingUser);
  return res
    .status(200)
    .json({ message: "User Logged in Successfully ", token });
};

const fetchAllBooks = async (req, res) => {
  try {
    const books = await ContentItem.find({});
    if (!books || books.length === 0) {
      return res.status(404).json({ message: "No books found" });
    }
    return res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const fetchBooks = async (req, res) => {
  try {
    const bookId = req.params.id;
    console.log("Fetching book with ID:", bookId);
    const book = await ContentItem.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const handleFeedback = async (req, res) => {
  try {
    const { feedback } = req.body;
    if (!feedback) {
      return res.status(400).json({ message: "Feedback is required" });
    }
    // Here you can save the feedback to a database or process it as needed
    const newFeedback = new Feedback({ feedback });
    await newFeedback.save();
    console.log("Feedback received:", feedback);
    return res.status(200).json({ message: "Feedback received successfully" });
  } catch (error) {
    console.error("Error handling feedback:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  handleUserSignup,
  fetchAllBooks,
  fetchBooks,
  handleFeedback,
  handleUserLogin,
};

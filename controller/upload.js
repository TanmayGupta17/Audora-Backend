const ContentItem = require("../models/upload");
const cloudinary = require("../utils/cloudinery"); // Make sure config is correct

// 📕 Upload Book
const handleBookUpload = async (req, res) => {
  try {
    console.log("Body:", req.body);
    console.log("Files:", req.files);

    const {
      title,
      author,
      category,
      summary,
      type,
      duration,
      rating,
      numlisteners,
      tags,
    } = req.body;

    if (!title || !summary || !category) {
      return res.status(400).json({
        message: "Title, summary, and category are required.",
      });
    }

    // 🖼️ Cover Image
    const coverImage = req.files?.coverImage?.[0]?.path || "";

    // 🎧 Audio
    let audioUrl = "";
    let finalDuration = duration || "";

    if (req.files?.audioUrl?.[0]) {
      const audioFile = req.files.audioUrl[0];
      audioUrl = audioFile.path;

      try {
        const publicId =
          audioFile.filename || audioUrl.split("/").pop().split(".")[0];

        const resource = await cloudinary.api.resource(publicId, {
          resource_type: "video",
        });

        if (resource?.duration) {
          const durationInSec = Math.ceil(resource.duration);
          const minutes = Math.floor(durationInSec / 60);
          const seconds = durationInSec % 60;
          finalDuration =
            seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} sec`;
        }
      } catch (err) {
        console.warn("Failed to get duration from Cloudinary:", err.message);
      }
    }

    const newBook = new ContentItem({
      title,
      author,
      category,
      summary,
      type,
      duration: finalDuration,
      rating,
      numlisteners,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      coverImage,
      audioUrl,
    });

    await newBook.save();
    return res.status(201).json({
      message: "Book uploaded successfully",
      book: newBook,
    });
  } catch (error) {
    console.error("🔥 Error uploading book:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// 📘 Upload Module
const handleModuleUpload = async (req, res) => {
  try {
    const bookId = req.params.id; // ✅ lowercase id
    console.log("Book ID:", bookId);
    const { title, description, transcript } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Module title is required." });
    }

    let audioUrl = "";
    let duration = "";

    if (req.file?.path) {
      audioUrl = req.file.path;

      try {
        const publicId =
          req.file.filename || audioUrl.split("/").pop().split(".")[0];

        const resource = await cloudinary.api.resource(publicId, {
          resource_type: "video",
        });

        if (resource?.duration) {
          const durationInSec = Math.ceil(resource.duration);
          const minutes = Math.floor(durationInSec / 60);
          const seconds = durationInSec % 60;
          duration =
            seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} sec`;
        }
      } catch (err) {
        console.warn("Failed to get duration from Cloudinary:", err.message);
      }
    }

    const module = {
      title,
      description,
      duration,
      transcript,
      audioUrl,
    };

    const updatedBook = await ContentItem.findByIdAndUpdate(
      bookId,
      { $push: { modules: module } },
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    return res
      .status(200)
      .json({ message: "Module added successfully", book: updatedBook });
  } catch (error) {
    console.error("Error uploading module:", error);
    return res
      .status(500)
      .json({ message: "Failed to upload module", error: error.message });
  }
};

module.exports = { handleBookUpload, handleModuleUpload };

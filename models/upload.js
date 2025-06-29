const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    duration: String, // e.g., "5 min"
    audioUrl: String,
    transcript: String,
    keyIdeas: [String], // optional array of bullet-point takeaways
  },
  { _id: false }
);

const ContentItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: String,
    type: {
      type: String,
      enum: ["book", "blog", "article"],
      default: "book",
    },
    category: String,
    summary: String,
    // fullContent: String, // raw content (optional for AI to parse)
    // transcript: String, // full audio transcript (optional)
    coverImage: String,
    audioUrl: String, // optional: full audio version
    duration: String, // optional: total duration
    rating: Number,
    numlisteners: String, // e.g., "12.5K"
    tags: [String], // for filtering and discovery
    modules: [ModuleSchema], // array of modules
  },
  { timestamps: true }
);

const ContentItem = mongoose.model("ContentItem", ContentItemSchema);
module.exports = ContentItem;

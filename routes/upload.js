const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/upload");
const {
  handleBookUpload,
  handleModuleUpload,
} = require("../controller/upload");

// Book upload with image and audio
router.post(
  "/book",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "audioUrl", maxCount: 1 },
  ]),
  handleBookUpload
);

// Module upload with audio
router.post("/module/:id", upload.single("audioUrl"), handleModuleUpload);

module.exports = router;

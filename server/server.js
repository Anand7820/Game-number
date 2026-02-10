const path = require("path");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const Tesseract = require("tesseract.js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isValid =
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg";
    cb(isValid ? null : new Error("Invalid image type."), isValid);
  },
});

function extractNumbers(text) {
  const matches = text.match(/\d+/g);
  if (!matches) return [];
  return matches;
}

function countFrequencies(numbers) {
  const counts = {};
  for (const num of numbers) {
    counts[num] = (counts[num] || 0) + 1;
  }
  return counts;
}

app.post("/count-text", (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text input is required." });
  }

  const numbers = extractNumbers(text);
  if (numbers.length === 0) {
    return res.status(400).json({ error: "No numbers found in input." });
  }

  const counts = countFrequencies(numbers);
  return res.json({ counts, totalNumbers: numbers.length });
});

app.post("/count-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "Image file is required." });
    }

    const { data } = await Tesseract.recognize(req.file.buffer, "eng", {
      tessedit_char_whitelist: "0123456789",
    });

    const numbers = extractNumbers(data.text || "");
    if (numbers.length === 0) {
      return res.status(400).json({ error: "No numbers found in image." });
    }

    const counts = countFrequencies(numbers);
    req.file.buffer = null;
    return res.json({ counts, totalNumbers: numbers.length });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to process image. Please try a clearer image.",
    });
  }
});

const clientBuildPath = path.join(__dirname, "..", "client", "dist");
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
}

app.use((err, req, res, next) => {
  if (err && err.message === "Invalid image type.") {
    return res.status(400).json({ error: "Only JPG or PNG files are allowed." });
  }
  return res.status(500).json({ error: "Server error." });
});

app.get("*", (req, res) => {
  if (fs.existsSync(clientBuildPath)) {
    return res.sendFile(path.join(clientBuildPath, "index.html"));
  }
  return res.status(404).json({ error: "Frontend build not found." });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

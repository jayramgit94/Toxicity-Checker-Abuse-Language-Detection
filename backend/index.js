const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Hugging Face API
const API_KEY = process.env.HUGGING_FACE_API_KEY;
const API_URL =
  "https://api-inference.huggingface.co/models/unitary/toxic-bert";

// 🔍 Function to check toxicity using Hugging Face
async function checkToxicity(text) {
  try {
    const response = await axios.post(
      API_URL,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Hugging Face API Response:", response.data);

    const allLabels = response.data[0]; // ✅ Fix: access nested array

    const toxicWords = allLabels
      .filter(
        (item) =>
          item.label?.toLowerCase().includes("toxic") && item.score > 0.7
      )
      .map((item) => ({
        word: item.label,
        score: item.score,
      }));

    return toxicWords.length > 0
      ? { status: "toxic", toxicWords, allLabels }
      : { status: "clean", allLabels };
  } catch (error) {
    console.error(
      "Error calling Hugging Face API:",
      error.response?.data || error.message
    );
    return {
      status: "error",
      message: error.response?.data?.error || error.message,
    };
  }
}

// 🌐 API endpoint to check toxicity
app.post("/check-toxic", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).send({ message: "Text is required" });
  }

  const result = await checkToxicity(text);
  res.json(result);
});

// 🧱 Serve frontend statically
app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// 🚀 Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

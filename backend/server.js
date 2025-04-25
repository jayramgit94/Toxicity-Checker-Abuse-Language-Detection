const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY;

app.post("/check-toxicity", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await axios.post(
      `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`,
      {
        comment: { text },
        languages: ["en"],
        requestedAttributes: { TOXICITY: {} },
      }
    );

    const score = response.data.attributeScores.TOXICITY.summaryScore.value;
    res.json({ score, isAbusive: score > 0.7 });
  } catch (error) {
    console.error("Error calling Perspective API:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

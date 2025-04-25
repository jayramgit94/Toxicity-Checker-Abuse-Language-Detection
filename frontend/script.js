async function checkText() {
  const inputText = document.getElementById("inputText").value.trim();
  const resultElement = document.getElementById("result");

  // Reset previous content and styling
  resultElement.innerHTML = "⏳ Checking...";
  resultElement.className = "checking";

  if (!inputText) {
    resultElement.innerHTML = "❗ Please enter some text to analyze.";
    resultElement.className = "gray";
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/check-toxic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: inputText }),
    });

    const data = await response.json();
    resultElement.className = ""; // Reset classes

    if (data.status === "clean") {
      resultElement.innerHTML = "✅ Text is clean!";
      resultElement.classList.add("green");
    } else if (data.status === "toxic") {
      const toxicWords = data.toxicWords
        .map((word) => `${word.word} (score: ${word.score.toFixed(2)})`)
        .join(", ");
      resultElement.innerHTML = `⚠️ <strong>Warning:</strong> Toxic content detected!<br><strong>Toxic labels:</strong> ${toxicWords}`;
      resultElement.classList.add("red");
    } else {
      resultElement.innerHTML = `❌ Error: ${data.message || "Unknown issue"}`;
      resultElement.classList.add("gray");
    }

    // Optional: Show all label scores
    if (Array.isArray(data.allLabels)) {
      const labelsHtml = data.allLabels
        .map((item) => `${item.label}: ${item.score.toFixed(4)}`)
        .join("<br>");
      resultElement.innerHTML += `<br><br><strong>All Labels & Scores:</strong><br>${labelsHtml}`;
    }
  } catch (error) {
    console.error("Error:", error);
    resultElement.innerHTML = "❌ Error occurred while checking.";
    resultElement.className = "gray";
  }
}

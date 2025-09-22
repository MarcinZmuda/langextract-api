import express from "express";
import bodyParser from "body-parser";
import { extract } from "langextract";

const app = express();
app.use(bodyParser.json({ limit: "2mb" }));

// Endpoint do parsowania HTML
app.post("/extract", async (req, res) => {
  try {
    const { html } = req.body;

    if (!html) {
      return res.status(400).json({ error: "Missing html" });
    }

    const result = await extract(html);
    res.json(result);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Langextract API running on port ${PORT}`);
});

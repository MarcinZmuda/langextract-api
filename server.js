import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { extract } from "langextract";

const app = express();
app.use(bodyParser.json({ limit: "2mb" }));

app.post("/extract", async (req, res) => {
  try {
    const { html, url } = req.body;

    let sourceHtml = html;
    if (!sourceHtml && url) {
      const response = await axios.get(url, { timeout: 10000 });
      sourceHtml = response.data;
    }

    if (!sourceHtml) {
      return res.status(400).json({ error: "Missing html or url" });
    }

    const result = await extract(sourceHtml);
    res.json(result);
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Langextract API running on port ${PORT}`);
});

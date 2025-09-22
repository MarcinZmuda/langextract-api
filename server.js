import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { extract } from "langextract";

const app = express();
app.use(bodyParser.json({ limit: "5mb" }));

// Obsługa pojedynczego lub wielu URLi
app.post("/extract", async (req, res) => {
  try {
    const { html, url, urls } = req.body;

    // 🔹 Jeśli jest lista linków
    if (Array.isArray(urls) && urls.length > 0) {
      const results = [];

      for (const u of urls) {
        try {
          const response = await axios.get(u, { timeout: 15000 });
          const result = await extract(response.data);
          results.push({
            url: u,
            success: true,
            data: result,
          });
        } catch (err) {
          results.push({
            url: u,
            success: false,
            error: err.message,
          });
        }
      }

      return res.json(results);
    }

    // 🔹 Jeśli jeden URL
    let sourceHtml = html;
    if (!sourceHtml && url) {
      const response = await axios.get(url, { timeout: 15000 });
      sourceHtml = response.data;
    }

    if (!sourceHtml) {
      return res.status(400).json({ error: "Missing html or url(s)" });
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

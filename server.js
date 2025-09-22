import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import * as cheerio from "cheerio";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

const app = express();
app.use(bodyParser.json({ limit: "2mb" }));

app.post("/extract", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Missing url" });
    }

    // Pobierz stronę
    const response = await axios.get(url, { timeout: 10000 });
    const html = response.data;

    // Parsowanie nagłówków
    const $ = cheerio.load(html);
    const title = $("title").first().text().trim();
    const h1 = $("h1").map((_, el) => $(el).text().trim()).get();
    const h2 = $("h2").map((_, el) => $(el).text().trim()).get();

    // Parsowanie treści "content" (Readability usuwa menu, reklamy itd.)
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    const content = article ? article.textContent.trim() : "";

    res.json({ url, title, h1, h2, content });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Extract API running on port ${PORT}`);
});

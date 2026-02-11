import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 8000;

const feedUrl =
  process.env.FEED_URL ||
  "https://superbits.org/rss.php?cat=4,26&p2p=1&passkey=2c7ec1061cb16c5f5ba5c42d8e7ab5b9";

app.use(express.static("."));

app.get("/rss", async (req, res) => {
  try {
    console.log(`[RSS] Fetching: ${feedUrl}`);

    const response = await fetch(feedUrl, { cache: "no-store" });
    if (!response.ok) {
      console.log(`[RSS] Error: HTTP ${response.status}`);
      res.status(response.status).send(await response.text());
      return;
    }

    const body = await response.text();
    console.log(`[RSS] Got ${body.length} bytes`);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.send(body);
  } catch (error) {
    console.error(`[RSS] Error:`, error.message);
    res.status(500).send("Kunne ikke hente RSS.");
  }
});

app.listen(port, () => {
  console.log(`Server kører på http://localhost:${port}`);
});

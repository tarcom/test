import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 8000;

// Læs cookies fra fil
const cookieFile = path.join(__dirname, "cookies.json");
let cookies = [];
try {
  const data = fs.readFileSync(cookieFile, "utf-8");
  cookies = JSON.parse(data);
  console.log(`Loaded ${cookies.length} cookie(s)`);
} catch (err) {
  console.warn("Kunne ikke læse cookies.json:", err.message);
}

// Konverter cookies til Puppeteer format
const getPuppeteerCookies = () => {
  return cookies.map((c) => ({
    name: c.name,
    value: c.value,
    domain: c.domain || ".superbits.org",
    path: c.path || "/",
  }));
};

app.use(express.static("."));

app.get("/p2p", async (req, res) => {
  let browser;
  try {
    const url = "https://superbits.org/p2p?sort=up&fc=true&p2p=false";

    console.log(`[P2P] Starting Puppeteer...`);
    // headless: false virker bedre lokalt på Windows
    browser = await puppeteer.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    console.log(`[P2P] Page created`);

    // Sæt cookies
    const puppeteerCookies = getPuppeteerCookies();
    if (puppeteerCookies.length > 0) {
      await page.setCookie(...puppeteerCookies);
      console.log(`[P2P] Cookies set: ${puppeteerCookies.length}`);
    }

    // Sæt realistic headers
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.setViewport({ width: 1920, height: 1080 });

    console.log(`[P2P] Navigating to: ${url}`);
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    console.log(`[P2P] Page loaded, waiting for Angular to render...`);

    // Vent på at Angular renderer indholdet
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const html = await page.content();
    console.log(`[P2P] Content size: ${html.length} bytes`);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);

    await browser.close();
  } catch (error) {
    console.error(`[P2P] Error:`, error.message);
    res.status(500).send(`Fejl: ${error.message}`);
  } finally {
    if (browser) await browser.close().catch(() => {});
  }
});

app.listen(port, () => {
  console.log(`Server kører på http://localhost:${port}`);
});

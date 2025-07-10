import express from "express";
import { executablePath } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 4000;

app.get("/search", async (req, res) => {
  const location = req.query.location;
  if (!location)
    return res.status(400).json({ error: "Missing location query param" });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: executablePath(),
  });

  const page = await browser.newPage();
  try {
    await page.goto("https://www.apartments.com/", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await page.waitForSelector("#quickSearchLookup");
    await page.type("#quickSearchLookup", location, { delay: 100 });

    await new Promise((resolve) => {
      setTimeout(resolve, 1000); // Wait for autocomplete suggestions
    });
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    await page.waitForSelector("article.placard", { timeout: 10000 });

    const listings = await page.$$eval("article.placard", (articles) =>
      articles.map((el) => {
        const title =
          el.querySelector(".js-placardTitle")?.textContent?.trim() || "";
        const price =
          el.querySelector(".price-range")?.textContent?.trim() || "";
        const bedBath =
          el.querySelector(".bed-range")?.textContent?.trim() || "";
        const type =
          el.querySelector(".property-type-for-rent")?.textContent?.trim() ||
          "";
        const link = el.querySelector("a.property-link")?.href || "";
        const img = el.querySelector("img")?.src || "";
        const phone =
          el.querySelector(".phone-link span")?.textContent?.trim() || "";
        return { title, price, bedBath, type, link, img, phone };
      })
    );

    res.json(listings);
  } catch (err) {
    console.error("Error:", err);
    res
      .status(500)
      .json({ error: "Failed to retrieve listings", detail: err.message });
  } finally {
    await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

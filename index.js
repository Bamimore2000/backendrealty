// import puppeteer from "puppeteer-extra";
// import StealthPlugin from "puppeteer-extra-plugin-stealth";

// puppeteer.use(StealthPlugin());

// (async () => {
//   // Step 1: Build searchQueryState for Florida
//   const regionId = 43; // Florida
//   const location = "florida";

//   const searchQueryState = {
//     filterState: {
//       isRecentlySold: { value: false },
//       isPreMarketPreForeclosure: { value: false },
//       isPreMarketForeclosure: { value: false },
//       isForRent: { value: false },
//       isForSaleByAgent: { value: true },
//       isForSaleByOwner: { value: true },
//       isAuction: { value: true },
//       isComingSoon: { value: true },
//       isForSaleForeclosure: { value: true },
//       isNewConstruction: { value: true },
//       sortSelection: { value: "globalrelevanceex" },
//     },
//     regionSelection: [{ regionId }],
//     usersSearchTerm: location,
//   };

//   const encoded = encodeURIComponent(JSON.stringify(searchQueryState));
//   const targetUrl = `https://www.zillow.com/homes/?category=SEMANTIC&searchQueryState=${encoded}`;

//   // Step 2: Launch Puppeteer
//   const browser = await puppeteer.launch({ headless: true });
//   const page = await browser.newPage();

//   // Step 3: Go to Zillow with Florida search
//   await page.goto(targetUrl, { waitUntil: "networkidle2" });

//   // Step 4: Log entire HTML content of the page
//   const html = await page.content();
//   console.log(html);

//   await browser.close();
// })();

// index.js
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    dumpio: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu", // Disable GPU acceleration
      "--disable-software-rasterizer",
      "--disable-dev-shm-usage",
    ],
  });

  const page = await browser.newPage();

  // page.on("framedetached", (frame) => {
  //   console.log(`Frame detached: ${frame.url()}`);
  // });
  // browser.on("disconnected", () => {
  //   console.log("Browser disconnected.");
  // });

  // Override the user agent to look like a real browser
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/133.0.0.0 Safari/537.36"
  );

  // Set viewport to standard desktop size
  await page.setViewport({ width: 1280, height: 800 });

  try {
    await page.goto("https://www.apartments.com/texas-city-tx/", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    await page.waitForSelector("article.placard");

    const results = await page.$$eval("article.placard", (articles) =>
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

    console.log(JSON.stringify(results, null, 2)); // prettified output
  } catch (err) {
    console.error("Error loading page:", err);
  }

  await browser.close();
})();

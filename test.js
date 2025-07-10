import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto("https://www.apartments.com/", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  const inputSelector = "#quickSearchLookup";

  try {
    // Wait for the input and type a query
    await page.waitForSelector(inputSelector);
    await page.type(inputSelector, "Florida", { delay: 100 });

    // Wait for autocomplete dropdown to appear
    await new Promise((resolve) => {
      setTimeout(resolve, 1000); // Adjust delay as needed
    });

    // Press ArrowDown to highlight the first suggestion, then Enter
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Wait for the redirect
    await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    // Log the final redirected URL
    console.log("Redirected to:", page.url());
  } catch (err) {
    console.error("Search simulation failed:", err);
  }

  await browser.close();
})();

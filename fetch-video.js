const puppeteer = require("puppeteer");
const fs = require("fs");

async function extractM3U8() {
  const url = "https://www.elahmad.com/tv/live/channel.php?id=almajd";

  console.log("فتح الصفحة:", url);

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  });

  const page = await browser.newPage();

  const m3u8Links = [];

  // التقاط كل طلبات الشبكة
  page.on("request", req => {
    const reqUrl = req.url();

    if (reqUrl.includes(".m3u8")) {
      console.log("🎯 تم العثور على رابط M3U8:", reqUrl);
      m3u8Links.push(reqUrl);
    }
  });

  await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

  await page.waitForTimeout(5000);

  await browser.close();

  if (m3u8Links.length === 0) {
    console.log("❌ لم يتم العثور على أي روابط M3U8");
    return;
  }

  fs.writeFileSync("m3u8.json", JSON.stringify(m3u8Links, null, 2));
  console.log("✔ تم حفظ الروابط في m3u8.json");
}

extractM3U8();

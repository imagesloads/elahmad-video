const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const Stealth = require("puppeteer-extra-plugin-stealth");

// تفعيل التخفي ضد Cloudflare
puppeteer.use(Stealth());

async function extractM3U8() {
  const url = "https://www.elahmad.com/tv/live/channel.php?id=almajd";

  console.log("🚀 فتح الصفحة:", url);

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled"
    ]
  });

  const page = await browser.newPage();

  const m3u8Links = [];

  // مراقبة كل طلبات الشبكة
  page.on("request", req => {
    const reqUrl = req.url();

    if (reqUrl.includes(".m3u8")) {
      console.log("🎯 M3U8 FOUND:", reqUrl);
      m3u8Links.push(reqUrl);
    }
  });

  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 0
  });

  // ننتظر تحميل الفيديو
  console.log("⌛ انتظار تحميل الصفحة...");
  await new Promise(resolve => setTimeout(resolve, 8000));

  await browser.close();

  if (m3u8Links.length === 0) {
    console.log("❌ لا توجد روابط M3U8");
    return;
  }

  // حفظ النتائج
  fs.writeFileSync("m3u8.json", JSON.stringify(m3u8Links, null, 2));
  console.log("✔ تم حفظ m3u8.json بنجاح");
}

extractM3U8();

const puppeteer = require("puppeteer");
const axios = require("axios");

const getProxy = async () => {
  const res = await axios.get(
    "https://gimmeproxy.com/api/getProxy?get=true&post=true&supportsHttps=true"
  );
  if (res.status !== 200 || !res.data) return;

  return res.data.curl;
};

const vote = async (wishId, useProxy) => {
  try {
    const selector = `#${wishId} > div > article > div.bg-light-ui-100.overflow-hidden.rounded-xl > section > div > div.flex.flex-row.items-center > div`;

    let args = [];
    if (useProxy) {
      const proxyString = await getProxy();
      args.push([`--proxy-server=${proxyString}`]);
    }

    const browser = await puppeteer.launch({
      headless: true,
      args,
    });
    const page = await browser.newPage();
    await page.goto("https://padlet.com/GOVTECH_GPO/wfhsetup");
    await page.waitForSelector(selector);
    await page.click(selector);
    await browser.close();
    return true;
  } catch {
    return false;
  }
};

const start = async (wishId, votes, useProxy) => {
  let success = 0;
  while (success < votes) {
    process.stdout.write(`Vote number: ${success + 1}...`);
    const res = await vote(wishId, useProxy);
    if (res) {
      success += 1;
      process.stdout.write(`success\n`);
    } else {
      process.stdout.write(`failed\n`);
    }
  }
};

const main = async () => {
  const errorMessage =
    "Usage: node index.js <wish id> <number of votes> <use proxy = true/>false>";

  const args = process.argv.slice(2);
  let [wishId, votes, useProxy] = args;
  if (!wishId) {
    console.log(errorMessage);
    process.exit(1);
  }
  votes = parseInt(votes, 10);
  if (isNaN(votes)) {
    console.log("Invalid votes", errorMessage);
    process.exit(1);
  }
  useProxy = useProxy === "true";
  await start(wishId, votes, useProxy);
};

main();
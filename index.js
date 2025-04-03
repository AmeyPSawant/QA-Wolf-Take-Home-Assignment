// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false, executablePath: 'C://Users//ameyp//AppData//Local//ms-playwright//chromium-1084//chrome-win//chrome.exe' });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");
  
  // Function to get current article count
  const getArticleCount = async () => {
    return await page.evaluate(() => document.querySelectorAll('.age').length);
  };

  // click more button to load more articles
  let articleCount = await getArticleCount();
  while (articleCount < 100) {
    try{
      await page.click(".morelink");
      await page.waitForTimeout(2000);
      articleCount = await getArticleCount();
      console.log("Loaded " + articleCount + " articles");
    }
    catch(e) {
      console.log("Error loading more articles: " + e);
      break;
    }
  }
  
  // get the first 100 articles in the list of articles
  const articles = await page.evaluate(() => {
    const ageElements = Array.from(document.querySelectorAll(".age"));
    return ageElements.slice(0,100).map((ele) => {
      const title = ele.getAttribute("title");
      return new Date(title).getTime();
    });
  });

  // Validate we have exactly 100 articles
  if (articles.length !== 100) {
    throw new Error("Found " + articles.length + " articles. Only 100 articles are expected.");
  }

  // Check if the articles are sorted from newest to oldest
  let isValid = true;
  for(i=0; i < articles.length - 1; i++) {
    if (articles[i] < articles[i + 1]) {
      isValid = false;
      break;
    }
  }

  // Print the result
  if(isValid) {
    console.log("Articles are sorted from newest to oldest");
  }
  else {
    console.log("Articles are NOT sorted from newest to oldest");
  }

  // Close browser
  await browser.close();
}

(async () => {
  await sortHackerNewsArticles();
})();

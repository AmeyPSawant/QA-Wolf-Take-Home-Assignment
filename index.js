// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { time } = require("console");
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false, executablePath: 'C://Users//ameyp//AppData//Local//ms-playwright//chromium-1084//chrome-win//chrome.exe' });
  const context = await browser.newContext();
  const page = await context.newPage();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");
  
  // Array to store collected article timestamps
  let articleTimestamps = [];

  // Function to collect new articles
  const collectArticles = async () => {
    const newTimestamps = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.age'))
        .map(ele => ele.getAttribute('title'))
        .filter(Boolean);
    });
    
    // Only add new timestamps we haven't seen before
    newTimestamps.forEach(timestamp => {
      if (!articleTimestamps.includes(timestamp)) {
        articleTimestamps.push(timestamp);
      }
    });
    
    return articleTimestamps.length;
  };

  // Initial collection
  let articleCount = await collectArticles();
  console.log(`Initial articles collected: ${articleCount}`);

  // Click "More" until we have at least 100 unique articles
  let attempt = 0;
  const maxAttempts = 10;
  
  while (articleCount < 100 && attempt < maxAttempts) {
    attempt++;
    try {
      await page.click('.morelink');
      await page.waitForTimeout(2000); // Wait for new articles to load
      
      const newCount = await collectArticles();
      console.log(`Attempt ${attempt}: Now have ${newCount} articles`);
      
      if (newCount <= articleCount) {
        console.log('No new articles loaded, stopping');
        break;
      }
      articleCount = newCount;
    } catch (e) {
      console.log('Error loading more articles:', e.message);
      break;
    }
  }

  // Get the first 100 articles as timestamps
  const timestamps = articleTimestamps
    .slice(0, 100)
    .map(title => new Date(title).getTime());

  // Validation of 100 articles count
  if (timestamps.length < 100) {
    throw new Error(`Only collected ${timestamps.length} articles, needed 100`);
  }
  else {
    console.log(`Collected ${timestamps.length} articles`);
  }

  // Check if the articles are sorted from newest to oldest
  let isValid = true;
  for(i=0; i < timestamps.length - 1; i++) {
    if (timestamps[i] < timestamps[i + 1]) {
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

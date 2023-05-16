const puppeteer = require('puppeteer');

/**
 * Perform a search on a given URL and return the results as a Promise
 * @param {string} url - The URL to perform the search on
 * @returns {Promise<Object>} A Promise that resolves to the search results object
 */
async function performSearch(url) {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--enable-features=NetworkService'],
        ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();

    // Wait for the search results to be returned
    const searchResults = new Promise((resolve, reject) => {
        page.on('response', async (response) => {
            if (response.url().endsWith('advance_search') && response.request().method() === 'POST') {
                response = await response.json();
                let results = [];
                for (const hit of response.data) {
                    results.push(hit)
                }
                

                resolve(results);
            }
        });
    });

    try {
        await page.goto(url);
        return await searchResults;
    } catch (err) {
        console.error('Error performing search:', err);
        throw err;
    } finally {
        await browser.close();
    }
};

module.exports = { performSearch }
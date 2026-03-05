import puppeteer from 'puppeteer';

(async () => {
    console.log('Starting headless browser...');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Listen for console events
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173');

    // Wait for load
    await new Promise(r => setTimeout(r, 2000));

    // Try to click play
    console.log('Clicking Master Play button...');
    try {
        await page.click('.master-play-btn');
    } catch (e) {
        console.log("Could not click master play: ", e.message);
    }

    console.log('Waiting 5s for sounds to decode...');
    await new Promise(r => setTimeout(r, 5000));

    console.log('Checking state...');

    await browser.close();
    console.log('Diagnosis complete.');
})();

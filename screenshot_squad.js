import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await new Promise(r => setTimeout(r, 1000));
  
  await page.type('input[type="text"]', 'Satoshi');
  
  // Get first team id
  const firstTeamId = await page.evaluate(() => {
    const selects = document.querySelectorAll('select');
    // find the one with team options
    for (const select of selects) {
      if (select.options.length > 2) { // likely the teams dropdown
        return select.options[1].value; // 0 is placeholder
      }
    }
    return null;
  });
  
  if (firstTeamId) {
    await page.select('select:last-of-type', firstTeamId);
  }
  
  await new Promise(r => setTimeout(r, 500));
  await page.click('button.ef-btn-primary'); 
  
  await new Promise(r => setTimeout(r, 1500));
  
  // Get all buttons in the dashboard and click "PLANTEL"
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button, a, div'));
    const squadBtn = buttons.find(b => b.textContent && b.textContent.includes('PLANTEL'));
    if(squadBtn) squadBtn.click();
  });
  
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'screenshot_real_squad.png' });
  await browser.close();
})();

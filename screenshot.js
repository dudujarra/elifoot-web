import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/');
  await new Promise(r => setTimeout(r, 1000));
  
  // type name
  await page.type('input[type="text"]', 'Satoshi');
  // click select
  await page.select('select', '1'); // Select first team
  // click start
  await page.click('button.ef-btn-primary'); 
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Now we should be in Dashboard. Let's find the "PLANTEL" button and click it.
  // The squad view button might be "PLANTEL" or "SQUAD"
  const buttons = await page.$$('button');
  for (let btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('PLANTEL') || text.includes('ELENCO') || text.includes('SQUAD')) {
          await btn.click();
          break;
      }
  }
  
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshot2.png' });
  await browser.close();
})();

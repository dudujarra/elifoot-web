const { PurgeCSS } = require('purgecss');
const fs = require('fs');
const { globSync } = require('glob');

async function purge() {
  const cssFiles = globSync('src/styles/**/*.css');
  let totalSaved = 0;
  
  for (const cssFile of cssFiles) {
    if (cssFile.includes('tokens/')) continue; // Skip tokens
    if (cssFile.includes('index.css')) continue; // Skip index files
    
    const originalSize = fs.statSync(cssFile).size;
    
    const purgeResults = await new PurgeCSS().purge({
      content: ['src/**/*.jsx', 'src/**/*.js', 'src/**/*.ts', 'src/**/*.tsx', 'index.html'],
      css: [cssFile],
      safelist: {
        standard: [/^bg-/, /^text-/, /^border-/, /active/, /hover/, /focus/, /disabled/, /is-/, /has-/, /::-webkit-scrollbar/, /^ef-/, /animate/],
        deep: [/var\(/]
      },
      defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || []
    });
    
    if (purgeResults && purgeResults.length > 0) {
      const newCss = purgeResults[0].css;
      const newSize = Buffer.byteLength(newCss, 'utf8');
      
      // If the file is basically empty now (less than 50 bytes of actual css)
      // we can maybe just empty it, but let's just write what purgecss outputs
      fs.writeFileSync(cssFile, newCss);
      totalSaved += (originalSize - newSize);
      console.log(`Purged ${cssFile} - saved ${originalSize - newSize} bytes`);
    }
  }
  console.log(`Total saved: ${totalSaved} bytes`);
}

purge().catch(console.error);

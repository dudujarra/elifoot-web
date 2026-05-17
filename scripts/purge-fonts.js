const fs = require('fs');
const path = require('path');

const walk = (dir, callback) => {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
};

walk('./src', (filePath) => {
  if (filePath.endsWith('.css') || filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    content = content.replace(/'Press Start 2P', monospace/g, "'Outfit', system-ui, sans-serif");
    content = content.replace(/"Press Start 2P", monospace/g, '"Outfit", system-ui, sans-serif');
    content = content.replace(/'Press Start 2P'/g, "'Outfit'");
    content = content.replace(/"Press Start 2P"/g, '"Outfit"');
    content = content.replace(/Press Start 2P/g, "Outfit");
    
    content = content.replace(/'Pixelify Sans', system-ui, sans-serif/g, "'Inter', system-ui, sans-serif");
    content = content.replace(/"Pixelify Sans", system-ui, sans-serif/g, '"Inter", system-ui, sans-serif');
    content = content.replace(/'Pixelify Sans'/g, "'Inter'");
    content = content.replace(/"Pixelify Sans"/g, '"Inter"');
    content = content.replace(/Pixelify Sans/g, "Inter");
    
    content = content.replace(/IBM Plex Mono/g, "JetBrains Mono");
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
});

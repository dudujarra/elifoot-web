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
    
    // Remove dangling -webkit- 
    content = content.replace(/\s*-webkit-\s*\n/g, "\n");
    // Also remove any remaining -webkit-image-rendering entirely just in case
    content = content.replace(/\s*-webkit-image-rendering:.*?;/g, "");
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed: ' + filePath);
    }
  }
});

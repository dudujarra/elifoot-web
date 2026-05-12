const fs = require('fs');
const path = require('path');

const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]/u;

let filesWithEmoji = 0;
let totalEmojis = 0;

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            let hasEmojiInFile = false;
            for (const line of lines) {
                if (emojiRegex.test(line)) {
                    hasEmojiInFile = true;
                    totalEmojis++;
                }
            }
            if (hasEmojiInFile) filesWithEmoji++;
        }
    }
}

walk('./src');
console.log(`Files with emojis: ${filesWithEmoji}`);
console.log(`Total lines with emojis: ${totalEmojis}`);

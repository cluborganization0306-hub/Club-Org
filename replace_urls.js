const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend/src');

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;

            // Replace template literals with string interpolation
            // e.g. `http://localhost:5000/api/events/${eventId}` -> `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${eventId}`
            const regexTemplate = /`http:\/\/localhost:5000(\/api[^`]+)`/g;
            if (regexTemplate.test(content)) {
                content = content.replace(regexTemplate, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}$1`");
                updated = true;
            }

            // Replace normal strings
            // e.g. 'http://localhost:5000/api/clubs' -> (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/clubs'
            const regexString = /'http:\/\/localhost:5000(\/api[^']+)'/g;
            if (regexString.test(content)) {
                content = content.replace(regexString, "(import.meta.env.VITE_API_URL || 'http://localhost:5000') + '$1'");
                updated = true;
            }

            if (updated) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    });
}

walkDir(directoryPath);
console.log('Done replacing URLs');

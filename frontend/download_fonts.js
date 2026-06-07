import fs from 'fs';
import path from 'path';
import https from 'https';

const cssUrl = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap';
const fontsDir = 'f:/Ki_7/EXE101/Jobready_deploy/Jobreadyluc/JOBREADYSystem-main/frontend/public/fonts';

if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
}

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
};

function fetchUrl(url, options = {}) {
    return new Promise((resolve, reject) => {
        https.get(url, options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return fetchUrl(res.headers.location, options).then(resolve).catch(reject);
            }
            let data = [];
            res.on('data', chunk => data.push(chunk));
            res.on('end', () => resolve(Buffer.concat(data)));
        }).on('error', reject);
    });
}

async function run() {
    try {
        console.log('Fetching CSS from Google Fonts...');
        const cssBuffer = await fetchUrl(cssUrl, { headers });
        let cssText = cssBuffer.toString();
        console.log('CSS fetched successfully.');

        // Find all font URLs
        const fontUrlRegex = /url\((https:\/\/fonts\.gstatic\.com\/s\/[^\)]+)\)/g;
        let match;
        const fontUrls = [];
        while ((match = fontUrlRegex.exec(cssText)) !== null) {
            fontUrls.push(match[1]);
        }
        
        console.log(`Found ${fontUrls.length} font files to download.`);
        
        // Download each font file
        for (let i = 0; i < fontUrls.length; i++) {
            const url = fontUrls[i];
            const filename = path.basename(url);
            const localPath = path.join(fontsDir, filename);
            
            console.log(`Downloading (${i + 1}/${fontUrls.length}): ${filename}...`);
            const fontBuffer = await fetchUrl(url);
            fs.writeFileSync(localPath, fontBuffer);
            
            // Replace the remote URL with local path in the CSS
            cssText = cssText.replaceAll(url, `/fonts/${filename}`);
        }
        
        // Write the local CSS file
        const cssFilePath = path.join(fontsDir, 'poppins.css');
        fs.writeFileSync(cssFilePath, cssText);
        console.log(`\npoppins.css updated successfully at ${cssFilePath}`);
        console.log('All fonts downloaded and mapped to local files!');
        
    } catch (err) {
        console.error('Error downloading fonts:', err);
    }
}

run();

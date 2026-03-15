const fs = require('fs');
const path = require('path');

// Read MSAL from node_modules
const msalPath = path.join(__dirname, 'node_modules/@azure/msal-browser/lib/msal-browser.min.js');

if (!fs.existsSync(msalPath)) {
  console.error('MSAL not found at:', msalPath);
  console.log('Available files:', fs.readdirSync(path.join(__dirname, 'node_modules/@azure/msal-browser/lib')));
  process.exit(1);
}

const msalCode = fs.readFileSync(msalPath, 'utf8');
console.log('MSAL loaded from npm:', msalCode.length, 'chars');

// Read index.html
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Replace the CDN script tag with inline script
const cdnTag = '<script src="https://alcdn.msauth.net/browser/2.38.3/js/msal-browser.min.js" crossorigin="anonymous"></script>';
const inlineTag = `<script>${msalCode}</script>`;

if (!html.includes(cdnTag)) {
  // Try alternate tag format
  const altTag = '<script src="https://alcdn.msauth.net/browser/2.38.3/js/msal-browser.min.js"></script>';
  if (html.includes(altTag)) {
    html = html.replace(altTag, inlineTag);
    console.log('Replaced alt CDN tag with inline MSAL');
  } else {
    console.error('Could not find MSAL script tag to replace!');
    process.exit(1);
  }
} else {
  html = html.replace(cdnTag, inlineTag);
  console.log('Replaced CDN tag with inline MSAL');
}

// Write to dist
if (!fs.existsSync('dist')) fs.mkdirSync('dist');
fs.writeFileSync(path.join(__dirname, 'dist/index.html'), html);

// Also copy staticwebapp.config.json to dist
if (fs.existsSync('staticwebapp.config.json')) {
  fs.copyFileSync('staticwebapp.config.json', 'dist/staticwebapp.config.json');
  console.log('Copied staticwebapp.config.json to dist/');
}

console.log('Build complete! dist/index.html:', html.length, 'chars');

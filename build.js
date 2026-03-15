const fs   = require('fs');
const path = require('path');

const msalPath = path.join(__dirname, 'node_modules/@azure/msal-browser/lib/msal-browser.min.js');
if (!fs.existsSync(msalPath)) {
  console.error('ERROR: MSAL not found at', msalPath);
  process.exit(1);
}

const msalCode = fs.readFileSync(msalPath, 'utf8');
console.log('MSAL loaded:', msalCode.length, 'bytes');

let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Replace ANY script tag loading msal from CDN with inline version
const replaced = html.replace(
  /<script[^>]*alcdn\.msauth\.net[^>]*><\/script>/g,
  `<script>${msalCode}</script>`
);

if (replaced === html) {
  console.error('ERROR: Could not find MSAL CDN script tag to replace');
  console.log('Looking for:', html.match(/<script[^>]*msal[^>]*>/g));
  process.exit(1);
}

// Write output directly - no dist folder needed
fs.writeFileSync(path.join(__dirname, 'index.html'), replaced);
console.log('SUCCESS: MSAL inlined into index.html. Final size:', replaced.length, 'bytes');

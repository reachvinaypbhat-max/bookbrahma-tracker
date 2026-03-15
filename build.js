const fs   = require('fs');
const path = require('path');

console.log('Starting BookBrahma build...');
console.log('Working directory:', process.cwd());
console.log('Files in root:', fs.readdirSync('.').join(', '));

// Read MSAL from node_modules
const msalPath = path.join(process.cwd(), 'node_modules/@azure/msal-browser/lib/msal-browser.min.js');
console.log('Looking for MSAL at:', msalPath);

if (!fs.existsSync(msalPath)) {
  console.error('MSAL not found! node_modules contents:');
  if (fs.existsSync('node_modules/@azure/msal-browser')) {
    console.log(fs.readdirSync('node_modules/@azure/msal-browser/lib').join(', '));
  }
  process.exit(1);
}

const msalCode = fs.readFileSync(msalPath, 'utf8');
console.log('MSAL loaded:', msalCode.length, 'bytes');

// Read index.html
const htmlPath = path.join(process.cwd(), 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');
console.log('index.html loaded:', html.length, 'bytes');

// Replace ANY msal CDN script tag with inline version
const before = html.length;
html = html.replace(
  /<script[^>]*alcdn\.msauth\.net[^"]*msal[^>]*><\/script>/g,
  `<script>${msalCode}</script>`
);

if (html.length === before) {
  // Try broader match
  html = html.replace(
    /<script[^>]*msal-browser[^>]*><\/script>/g,
    `<script>${msalCode}</script>`
  );
}

console.log('HTML size after MSAL inline:', html.length, 'bytes (was', before, ')');

if (html.length <= before) {
  console.error('WARNING: MSAL script tag not found or replacement failed');
  // Show what script tags exist
  const scripts = html.match(/<script[^>]*src[^>]*>/g) || [];
  console.log('Script tags found:', scripts.join('\n'));
}

// Write to dist/ folder
if (!fs.existsSync('dist')) fs.mkdirSync('dist');

// Copy staticwebapp.config.json to dist if it exists
if (fs.existsSync('staticwebapp.config.json')) {
  fs.copyFileSync('staticwebapp.config.json', 'dist/staticwebapp.config.json');
}

fs.writeFileSync('dist/index.html', html);
console.log('Build complete! dist/index.html written:', html.length, 'bytes');

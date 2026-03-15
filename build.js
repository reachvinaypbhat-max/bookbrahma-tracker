const fs = require('fs');
const path = require('path');

// Read MSAL from node_modules
const msalPath = path.join(__dirname, 'node_modules/@azure/msal-browser/lib/msal-browser.min.js');
const msalCode = fs.readFileSync(msalPath, 'utf8');

// Read index.html
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Replace all external MSAL script tags with inline script
const msalScriptBlock = `<script src="https://alcdn.msauth.net/browser/2.38.3/js/msal-browser.min.js"></script>
<script>
if (typeof msal === 'undefined') {
  document.write('<script src="https://cdn.jsdelivr.net/npm/@azure/msal-browser@2.38.3/lib/msal-browser.min.js"><\\/script>');
}
</script>
<script>
if (typeof msal === 'undefined') {
  document.write('<script src="https://unpkg.com/@azure/msal-browser@2.38.3/lib/msal-browser.min.js"><\\/script>');
}
</script>`;

const inlineScript = `<script>${msalCode}</script>`;

html = html.replace(msalScriptBlock, inlineScript);

// Write to dist folder
if (!fs.existsSync('dist')) fs.mkdirSync('dist');
fs.writeFileSync(path.join(__dirname, 'dist/index.html'), html);
console.log('Build complete. MSAL bundled inline. dist/index.html: ' + html.length + ' chars');

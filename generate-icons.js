// generate-icons.js
// Run this script to generate all PWA icons from a single source image
// Usage: node generate-icons.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Icon sizes to generate
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Source image path (replace with your logo)
const sourceImage = path.join(__dirname, 'logo.png'); // You need to provide this

// Check if source image exists
if (!fs.existsSync(sourceImage)) {
  console.error(`
❌ Source image not found!

Please create a logo.png file (at least 512x512px) in the project root.
You can create a simple logo with the KAAPAV branding:
- Background: #0f1419 (brand-dark)
- Icon color: #f59e0b (brand-gold)
- Bot icon or "K" letter
  `);
  process.exit(1);
}

// Generate icons
async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  for (const size of sizes) {
    try {
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 15, g: 20, b: 25, alpha: 1 } // brand-dark
        })
        .png()
        .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
      
      console.log(`✅ Generated icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Error generating ${size}x${size}:`, error.message);
    }
  }

  console.log('\n✨ All icons generated successfully!');
}

generateIcons();

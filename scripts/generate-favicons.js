const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Flower SVG with brand colors: gold/brown on cream background
// Static (no animation) for favicon compatibility
const flowerSvg = `<svg width="192" height="192" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="32" fill="#FDF6EC"/>
  <g transform="translate(96,96)">
    <ellipse cx="0" cy="-38" rx="14" ry="35" stroke="#6B3F1F" stroke-width="9" fill="none" transform="rotate(0)" />
    <ellipse cx="0" cy="-38" rx="14" ry="35" stroke="#6B3F1F" stroke-width="9" fill="none" transform="rotate(60)" />
    <ellipse cx="0" cy="-38" rx="14" ry="35" stroke="#6B3F1F" stroke-width="9" fill="none" transform="rotate(120)" />
    <ellipse cx="0" cy="-38" rx="14" ry="35" stroke="#6B3F1F" stroke-width="9" fill="none" transform="rotate(180)" />
    <ellipse cx="0" cy="-38" rx="14" ry="35" stroke="#6B3F1F" stroke-width="9" fill="none" transform="rotate(240)" />
    <ellipse cx="0" cy="-38" rx="14" ry="35" stroke="#6B3F1F" stroke-width="9" fill="none" transform="rotate(300)" />
    <circle cx="0" cy="0" r="10" fill="#6B3F1F" />
  </g>
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');

async function generateFavicons() {
  const svgBuffer = Buffer.from(flowerSvg);

  // favicon.png (192x192)
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Created favicon.png (192x192)');

  // favicon-48.png (48x48)
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(path.join(publicDir, 'favicon-48.png'));
  console.log('Created favicon-48.png (48x48)');

  // apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png (180x180)');

  // favicon.ico — use 48x48 PNG as ICO (browsers accept PNG-in-ICO)
  // We'll create a proper ICO by embedding multiple sizes
  const ico16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();
  const ico32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  const ico48 = await sharp(svgBuffer).resize(48, 48).png().toBuffer();

  const icoBuffer = buildIco([ico16, ico32, ico48]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Created favicon.ico (16x16, 32x32, 48x48)');

  // Also write a static favicon.svg (no animation, proper colors) as fallback
  const staticSvg = `<svg width="64" height="64" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="192" height="192" rx="32" fill="#FDF6EC"/>
  <g transform="translate(96,96)">
    <ellipse cx="0" cy="-38" rx="14" ry="35" stroke="#6B3F1F" stroke-width="9" fill="none" transform="rotate(0)" />
    <ellipse cx="0" cy="-38" rx="14" ry="35" stroke="#6B3F1F" stroke-width="9" fill="none" transform="rotate(60)" />
    <ellipse cx="0" cy="-38" rx="14" ry="35" stroke="#6B3F1F" stroke-width="9" fill="none" transform="rotate(120)" />
    <ellipse cx="0" cy="-38" rx="14" ry="35" stroke="#6B3F1F" stroke-width="9" fill="none" transform="rotate(180)" />
    <ellipse cx="0" cy="-38" rx="14" ry="35" stroke="#6B3F1F" stroke-width="9" fill="none" transform="rotate(240)" />
    <ellipse cx="0" cy="-38" rx="14" ry="35" stroke="#6B3F1F" stroke-width="9" fill="none" transform="rotate(300)" />
    <circle cx="0" cy="0" r="10" fill="#6B3F1F" />
  </g>
</svg>`;
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), staticSvg);
  console.log('Updated favicon.svg (static, brand colors)');

  console.log('\nAll favicon files generated successfully!');
}

// Build a minimal ICO file containing PNG images
function buildIco(pngBuffers) {
  const count = pngBuffers.length;
  // ICO header: 6 bytes
  // Directory entries: 16 bytes each
  // Image data: concatenated PNG buffers

  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * count;
  const dataOffset = headerSize + dirSize;

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);     // reserved
  header.writeUInt16LE(1, 2);     // type: ICO
  header.writeUInt16LE(count, 4); // count

  const entries = [];
  let offset = dataOffset;

  for (const png of pngBuffers) {
    // Read dimensions from PNG IHDR
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);

    const entry = Buffer.alloc(16);
    entry.writeUInt8(width >= 256 ? 0 : width, 0);   // width (0 = 256)
    entry.writeUInt8(height >= 256 ? 0 : height, 1);  // height
    entry.writeUInt8(0, 2);   // color count
    entry.writeUInt8(0, 3);   // reserved
    entry.writeUInt16LE(1, 4);  // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);  // size of image data
    entry.writeUInt32LE(offset, 12);     // offset of image data
    entries.push(entry);
    offset += png.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers]);
}

generateFavicons().catch(console.error);

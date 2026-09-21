import fs from "fs";
import zlib from "zlib";
import path from "path";

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function generatePng(width, height, isMaskable = false) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdr = createChunk("IHDR", ihdrData);

  // Raw image data: scanlines with filter byte 0
  const raw = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const outerR = width * 0.46;
  const innerR = width * 0.38;

  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background: Deep purple (#2e1065 / #3b0764) to Violet (#581c87) gradient
      const t = (x + y) / (width + height);
      let r = Math.round(46 + t * 40);
      let g = Math.round(16 + t * 20);
      let b = Math.round(101 + t * 60);
      let a = 255;

      // Rounded rect or circle icon badge
      if (!isMaskable) {
        // Rounded app icon shape
        const cornerR = width * 0.22;
        const inX = Math.abs(x - cx) - (cx - cornerR);
        const inY = Math.abs(y - cy) - (cy - cornerR);
        if (inX > 0 && inY > 0) {
          const cornerDist = Math.sqrt(inX * inX + inY * inY);
          if (cornerDist > cornerR) {
            a = 0;
          }
        }
      }

      // Draw sales clipboard / chart symbol in the center
      if (a > 0) {
        // Clipboard base
        const cbLeft = cx - width * 0.22;
        const cbRight = cx + width * 0.22;
        const cbTop = cy - height * 0.22;
        const cbBottom = cy + height * 0.28;

        if (x >= cbLeft && x <= cbRight && y >= cbTop && y <= cbBottom) {
          // Inner card background: pure white / off-white
          r = 255;
          g = 255;
          b = 255;

          // Clip at the top
          if (
            y < cbTop + height * 0.07 &&
            x >= cx - width * 0.11 &&
            x <= cx + width * 0.11
          ) {
            r = 147;
            g = 51;
            b = 234; // purple clip
          }

          // Checkmark or bars inside
          // Bar 1 (Emerald)
          if (
            y >= cbTop + height * 0.12 &&
            y <= cbTop + height * 0.16 &&
            x >= cbLeft + width * 0.06 &&
            x <= cbRight - width * 0.06
          ) {
            r = 16;
            g = 185;
            b = 129; // emerald-500
          }
          // Bar 2 (Purple)
          if (
            y >= cbTop + height * 0.21 &&
            y <= cbTop + height * 0.25 &&
            x >= cbLeft + width * 0.06 &&
            x <= cbRight - width * 0.12
          ) {
            r = 124;
            g = 58;
            b = 237; // purple-600
          }
          // Bar 3 (Slate/Blue)
          if (
            y >= cbTop + height * 0.3 &&
            y <= cbTop + height * 0.34 &&
            x >= cbLeft + width * 0.06 &&
            x <= cbRight - width * 0.18
          ) {
            r = 59;
            g = 130;
            b = 246; // blue-500
          }
          // Bottom check badge
          if (
            y >= cbTop + height * 0.38 &&
            y <= cbTop + height * 0.44 &&
            x >= cbLeft + width * 0.06 &&
            x <= cbLeft + width * 0.18
          ) {
            r = 16;
            g = 185;
            b = 129; // green dot
          }
        }
      }

      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
      raw[offset++] = a;
    }
  }

  const deflated = zlib.deflateSync(raw, { level: 9 });
  const idat = createChunk("IDAT", deflated);
  const iend = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

const publicDir = path.resolve("public");
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(
  path.join(publicDir, "pwa-192x192.png"),
  generatePng(192, 192, false),
);
fs.writeFileSync(
  path.join(publicDir, "pwa-512x512.png"),
  generatePng(512, 512, false),
);
fs.writeFileSync(
  path.join(publicDir, "pwa-maskable-512x512.png"),
  generatePng(512, 512, true),
);
fs.writeFileSync(
  path.join(publicDir, "apple-touch-icon.png"),
  generatePng(180, 180, false),
);
fs.writeFileSync(
  path.join(publicDir, "favicon.ico"),
  generatePng(64, 64, false),
);

console.log("PWA PNG Icons generated successfully in public/ folder!");

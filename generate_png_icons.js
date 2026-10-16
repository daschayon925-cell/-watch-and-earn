import fs from 'fs';
import zlib from 'zlib';

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCrcTable();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcPayload = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcPayload);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, crcPayload, crcBuf]);
}

function generatePng(width, height, isMaskable = false) {
  // Raw RGBA buffer with filter byte 0 for each row
  const rowStride = 1 + width * 4;
  const rawData = Buffer.alloc(rowStride * height);

  const cx = width / 2;
  const cy = height / 2;
  const outerR = Math.min(width, height) * (isMaskable ? 0.38 : 0.44);
  const innerR = outerR * 0.78;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowStride;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default background: Dark gradient (#05070B to #0B1626)
      const gradFactor = y / height;
      let r = Math.round(5 + 6 * gradFactor);
      let g = Math.round(7 + 15 * gradFactor);
      let b = Math.round(11 + 27 * gradFactor);
      let a = 255;

      // Outer ring
      if (dist <= outerR + 4 && dist >= outerR - 4) {
        // Emerald border
        r = 16; g = 185; b = 129; a = 255;
      } else if (dist < outerR - 4 && dist >= innerR) {
        // Dark emerald tinted outer circle
        r = 4; g = 32; b = 23; a = 255;
      } else if (dist < innerR) {
        // Center disc
        r = 10; g = 22; b = 38; a = 255;

        // Play Triangle: from (cx - innerR*0.35, cy - innerR*0.5) to (cx + innerR*0.45, cy) to (cx - innerR*0.35, cy + innerR*0.5)
        const triLeft = cx - innerR * 0.3;
        const triRight = cx + innerR * 0.42;
        const triTop = cy - innerR * 0.45;
        const triBottom = cy + innerR * 0.45;

        if (x >= triLeft && x <= triRight) {
          const prog = (x - triLeft) / (triRight - triLeft);
          const topBound = cy - (innerR * 0.45) * (1 - prog);
          const bottomBound = cy + (innerR * 0.45) * (1 - prog);

          if (y >= topBound && y <= bottomBound) {
            // Gradient Emerald to Mint
            r = Math.round(52 + (16 - 52) * prog);
            g = Math.round(211 + (185 - 211) * prog);
            b = Math.round(153 + (129 - 153) * prog);
          }
        }
      }

      // Gold Coin Badge top right
      const coinCx = cx + outerR * 0.65;
      const coinCy = cy - outerR * 0.65;
      const coinDist = Math.sqrt((x - coinCx) ** 2 + (y - coinCy) ** 2);
      const coinR = outerR * 0.32;

      if (coinDist <= coinR) {
        if (coinDist >= coinR - 3) {
          r = 245; g = 158; b = 11; // Gold border
        } else {
          r = 252; g = 211; b = 77; // Bright gold fill
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Deflate
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Non-interlaced

  const ihdrChunk = writeChunk('IHDR', ihdr);
  const idatChunk = writeChunk('IDAT', deflated);
  const iendChunk = writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate all required PWA icons
fs.writeFileSync('public/icon-192.png', generatePng(192, 192, false));
fs.writeFileSync('public/icon-512.png', generatePng(512, 512, false));
fs.writeFileSync('public/icon-maskable-512.png', generatePng(512, 512, true));
fs.writeFileSync('public/apple-touch-icon.png', generatePng(180, 180, false));

console.log('✅ Generated all compliant PWA icons in /public: icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png');

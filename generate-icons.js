import sharp from 'sharp';
import { promises as fs } from 'fs';

const sizes = [
  { size: 192, name: 'icon-192.png', maskable: false },
  { size: 512, name: 'icon-512.png', maskable: false },
  { size: 192, name: 'icon-192-maskable.png', maskable: true },
  { size: 512, name: 'icon-512-maskable.png', maskable: true },
];

async function generateIcons() {
  const inputPath = './public/assets/od-logo.png';
  const outputDir = './public/icons';

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  console.log('Generating PWA icons...');

  for (const { size, name, maskable } of sizes) {
    try {
      const img = sharp(inputPath);
      const metadata = await img.metadata();

      if (maskable) {
        // For maskable icons, add padding (safe zone is 40% from edge)
        const paddedSize = Math.round(size / 0.8); // 20% padding on each side
        const padding = Math.round((paddedSize - size) / 2);

        await img
          .resize(size, size, { fit: 'contain', background: { r: 17, g: 17, b: 17, alpha: 1 } })
          .extend({
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
            background: { r: 17, g: 17, b: 17, alpha: 1 }
          })
          .resize(size, size)
          .toFile(`${outputDir}/${name}`);
      } else {
        // Standard icons
        await img
          .resize(size, size, { fit: 'contain', background: { r: 17, g: 17, b: 17, alpha: 1 } })
          .toFile(`${outputDir}/${name}`);
      }

      console.log(`✓ Generated ${name}`);
    } catch (error) {
      console.error(`✗ Failed to generate ${name}:`, error.message);
    }
  }

  console.log('Icon generation complete!');
}

generateIcons().catch(console.error);

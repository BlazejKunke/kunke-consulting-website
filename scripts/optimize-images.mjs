import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imagesDir = './public/images';

// Large PNGs to convert to WebP (illustrations - can use 80% quality)
const largePngs = [
  'flourish.png',
  'grow.png',
  'automate.png',
  'LevelUp.png',
  'plant.png',
  'Hello.png',
  'Dawid_GG.png',
  'ai-workshop-hero.png'
];

// Large JPGs to optimize
const largeJpgs = [
  'SylwiaOlejniczak.jpg',
  'TomaszLozowicki.jpg',
  'BlazejKunke_Warsaw_AIWorkshop_November.JPG',
  'AnnaKostrzewa.jpg',
  'BartoszRadacz.jpg'
];

async function optimizeImages() {
  let totalSaved = 0;

  // Convert PNGs to WebP
  for (const file of largePngs) {
    const inputPath = path.join(imagesDir, file);
    const outputPath = path.join(imagesDir, file.replace(/\.png$/i, '.webp'));

    if (!fs.existsSync(inputPath)) continue;

    const originalSize = fs.statSync(inputPath).size;

    await sharp(inputPath)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    const newSize = fs.statSync(outputPath).size;
    const saved = originalSize - newSize;
    totalSaved += saved;
    console.log(`${file} -> ${file.replace(/\.png$/i, '.webp')}: ${(originalSize/1024).toFixed(0)}KB -> ${(newSize/1024).toFixed(0)}KB (saved ${(saved/1024).toFixed(0)}KB)`);
  }

  // Optimize JPGs to WebP
  for (const file of largeJpgs) {
    const inputPath = path.join(imagesDir, file);
    const outputPath = path.join(imagesDir, file.replace(/\.(jpg|jpeg|JPG)$/i, '.webp'));

    if (!fs.existsSync(inputPath)) continue;

    const originalSize = fs.statSync(inputPath).size;

    // Team photos: resize to max 600px width
    await sharp(inputPath)
      .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(outputPath);

    const newSize = fs.statSync(outputPath).size;
    const saved = originalSize - newSize;
    totalSaved += saved;
    console.log(`${file} -> WebP: ${(originalSize/1024).toFixed(0)}KB -> ${(newSize/1024).toFixed(0)}KB (saved ${(saved/1024).toFixed(0)}KB)`);
  }

  // Create optimized hero image
  const heroInput = path.join(imagesDir, 'Workshop2025.JPG');
  if (fs.existsSync(heroInput)) {
    const originalSize = fs.statSync(heroInput).size;

    // Create WebP version at 1200px width for hero
    await sharp(heroInput)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(path.join(imagesDir, 'Workshop2025.webp'));

    // Create smaller version for mobile
    await sharp(heroInput)
      .resize(600, null, { withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(imagesDir, 'Workshop2025-mobile.webp'));

    const heroSize = fs.statSync(path.join(imagesDir, 'Workshop2025.webp')).size;
    const mobileSize = fs.statSync(path.join(imagesDir, 'Workshop2025-mobile.webp')).size;

    console.log(`Workshop2025.JPG -> Workshop2025.webp: ${(originalSize/1024).toFixed(0)}KB -> ${(heroSize/1024).toFixed(0)}KB`);
    console.log(`Workshop2025.JPG -> Workshop2025-mobile.webp: ${(originalSize/1024).toFixed(0)}KB -> ${(mobileSize/1024).toFixed(0)}KB`);
    totalSaved += originalSize - heroSize;
  }

  console.log(`\nTotal saved: ${(totalSaved/1024/1024).toFixed(2)}MB`);
}

optimizeImages().catch(console.error);

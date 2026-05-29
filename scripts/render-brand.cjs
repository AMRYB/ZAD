// Run with a local sharp installation to regenerate the code-native vector asset.
const fs=require('node:fs');
const path=require('node:path');
const sharp=require(process.env.SHARP_MODULE_PATH || 'sharp');
const root=path.resolve(__dirname,'..');
const svg=fs.readFileSync(path.join(root,'assets/brand-mark.svg'),'utf8');
const foreground=svg.replace(/<rect width="1024" height="1024" rx="180" fill="#176B57"\/>/,'').replace(/<circle cx="512" cy="512" r="348"[^>]*\/>/,'');
Promise.all([
  sharp(Buffer.from(svg)).png().toFile(path.join(root,'assets/brand-icon.png')),
  sharp(Buffer.from(foreground)).png().toFile(path.join(root,'assets/brand-foreground.png')),
  sharp(Buffer.from(foreground.replaceAll('#E4BC74','#FFFFFF'))).png().toFile(path.join(root,'assets/brand-monochrome.png')),
  sharp(Buffer.from(svg)).resize(64,64).png().toFile(path.join(root,'assets/brand-favicon.png')),
]).catch(error=>{console.error(error.message);process.exitCode=1;});

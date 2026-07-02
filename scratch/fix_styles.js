import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  // 1. Direct color names and font weights
  [/bg-\[\#07070b\]/g, 'bg-bg'],
  [/border-t-\[\#e7b84b\]/g, 'border-t-gold'],
  [/font-\[500\]/g, 'font-medium'],
  [/bg-\[\#e7b84b\]/g, 'bg-gold'],
  [/text-\[\#9aa0ad\]/g, 'text-mute'],
  [/bg-\[\#12121b\]/g, 'bg-surface'],
  [/bg-\[\#f7cf6a\]/g, 'bg-gold-2'],
  [/text-\[\#e7b84b\]/g, 'text-gold'],
  [/border-\[\#e7b84b\]/g, 'border-gold'],
  [/caret-\[\#e7b84b\]/g, 'caret-gold'],
  [/border-\[\#e7b84b\]\/30/g, 'border-gold/30'],
  [/font-\[700\]/g, 'font-bold'],
  [/font-\[600\]/g, 'font-semibold'],
  [/h-\[1px\]/g, 'h-px'],
  [/grayscale-\[20\%\]/g, 'grayscale-20'],

  // 2. Gradients
  [/bg-gradient-to-t/g, 'bg-linear-to-t'],
  [/bg-gradient-to-br/g, 'bg-linear-to-br'],
  [/bg-gradient-to-tr/g, 'bg-linear-to-tr'],
  [/bg-gradient-to-b/g, 'bg-linear-to-b'],

  // 3. Hover classes
  [/hover:bg-white\/\[0\.045\]/g, 'hover:bg-white/4.5'],
  [/hover:bg-white\/\[0\.06\]/g, 'hover:bg-white/6'],

  // 4. White / Yellow opacity values
  [/bg-white\/\[0\.045\]/g, 'bg-white/4.5'],
  [/border-white\/\[0\.065\]/g, 'border-white/6.5'],
  [/border-white\/\[0\.08\]/g, 'border-white/8'],
  [/border-white\/\[\.08\]/g, 'border-white/8'],
  [/bg-white\/\[0\.05\]/g, 'bg-white/5'],
  [/bg-white\/\[\.05\]/g, 'bg-white/5'],
  [/border-white\/\[0\.11\]/g, 'border-white/11'],
  [/border-white\/\[0\.10\]/g, 'border-white/10'],
  [/bg-white\/\[0\.08\]/g, 'bg-white/8'],
  [/bg-white\/\[0\.06\]/g, 'bg-white/6'],
  [/bg-white\/\[0\.12\]/g, 'bg-white/12'],
  [/bg-white\/\[0\.02\]/g, 'bg-white/2'],
  [/border-white\/\[0\.05\]/g, 'border-white/5'],
  [/bg-yellow-500\/\[0\.04\]/g, 'bg-yellow-500/4'],
  [/border-white\/\[0\.12\]/g, 'border-white/12'],
  [/bg-white\/\[0\.03\]/g, 'bg-white/3'],
  [/border-white\/\[0\.06\]/g, 'border-white/6'],
  [/bg-white\/\[0\.04\]/g, 'bg-white/4'],
  [/bg-white\/\[0\.015\]/g, 'bg-white/1.5'],
  [/border-white\/\[0\.04\]/g, 'border-white/4']
];

let replacedCount = 0;
for (const [regex, replacement] of replacements) {
  const matched = content.match(regex);
  if (matched) {
    replacedCount += matched.length;
    content = content.replace(regex, replacement);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Successfully completed ${replacedCount} style improvements in App.tsx.`);

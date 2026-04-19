const fs = require('fs');
const path = require('path');

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
};

const replaceInFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;
  
  const lines = content.split('\n');
  const newLines = lines.map(line => {
    let newLine = line;
    // Replace transparent whites with transparent foreground
    newLine = newLine.replace(/text-foreground\/0\.([0-9]+)/g, 'text-foreground/[0.$1]');
    newLine = newLine.replace(/bg-foreground\/0\.([0-9]+)/g, 'bg-foreground/[0.$1]');
    newLine = newLine.replace(/border-foreground\/0\.([0-9]+)/g, 'border-foreground/[0.$1]');
    newLine = newLine.replace(/ring-foreground\/0\.([0-9]+)/g, 'ring-foreground/[0.$1]');
    newLine = newLine.replace(/shadow-foreground\/0\.([0-9]+)/g, 'shadow-foreground/[0.$1]');
    newLine = newLine.replace(/divide-foreground\/0\.([0-9]+)/g, 'divide-foreground/[0.$1]');
    
    // Replace hardcoded dark colors to enable Light Theme
    newLine = newLine.replace(/bg-\[#02020a\]/g, 'bg-background');
    newLine = newLine.replace(/bg-\[#050505\]/g, 'bg-background');
    newLine = newLine.replace(/bg-\[#0a0a0a\]\/([0-9]+)/g, 'bg-surface-subtle/$1');
    newLine = newLine.replace(/bg-\[#0a0a0a\]/g, 'bg-surface-subtle');

    return newLine;
  });
  
  const result = newLines.join('\n');
  if (result !== original) {
    fs.writeFileSync(filePath, result);
    console.log('Updated', filePath);
  }
}

const allFiles = walkSync('./src');
allFiles.forEach(replaceInFile);
console.log('Done!');

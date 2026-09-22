const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../src/pages');
const translationsPath = path.join(__dirname, '../src/data/translations.ts');

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '').substring(0, 40);
}

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

let allNewKeys = {};

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let fileModified = false;

  // Regex to match text between tags like >Some Text<
  // We ignore anything that contains { or } to avoid breaking expressions
  const regex = />([^<{}]+)</g;
  
  content = content.replace(regex, (match, textContent) => {
    const trimmed = textContent.trim();
    
    // Ignore empty strings, pure numbers, or single characters
    if (!trimmed || trimmed.length < 2 || !/[a-zA-Z]/.test(trimmed)) {
      return match;
    }

    const key = `auto_${slugify(trimmed)}`;
    allNewKeys[key] = trimmed;
    fileModified = true;

    // Replace "> Text <" with "> {t('key')} <" while preserving surrounding whitespace
    return match.replace(textContent, textContent.replace(trimmed, `{t("${key}")}`));
  });

  if (fileModified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

if (Object.keys(allNewKeys).length > 0) {
  let translationsContent = fs.readFileSync(translationsPath, 'utf8');
  const stringified = Object.entries(allNewKeys).map(([k, v]) => `    "${k}": ${JSON.stringify(v)},`).join('\n');
  translationsContent = translationsContent.replace('// ════════════════════════════════════════════════════════════════════════', stringified + '\n  // ════════════════════════════════════════════════════════════════════════');
  fs.writeFileSync(translationsPath, translationsContent, 'utf8');
  console.log(`Appended ${Object.keys(allNewKeys).length} new keys to translations.ts`);
} else {
  console.log('No new keys found.');
}

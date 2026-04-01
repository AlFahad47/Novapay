import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcDir = path.join(root, "src");

const replacements = new Map([
  [ "✅"],
  [ "✕"],
  [ "⏳"],
  [ "→"],
  [ "−"],
  [, "€"],
  [, "─"],
  [, "৳"],
  [, "⚡"],
  [ ""],
  [, "👤"],
  [, "🆔"],
  [, "📞"],
  [, "🔒"],
  [, "💰"],
  [, "🔵"],
  [, "🟣"],
  [, "🚨"],
  [, "💳"],
  [, "🎉"],
  [ "•"],
  [, "–"],
  [, "—"],
  [, "…"],
  [, "™"],
  [, "\""],
  [, "\""],
  [, "'"],
  [, "'"],
  [ "·"],
  [ "£"],
  [ "¥"],
  [ " "],
  [, ""],
]);

function getAllFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...getAllFiles(full));
    else if (/\.(ts|tsx|js|jsx|json|md|css)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

const files = getAllFiles(srcDir);
let touched = 0;

for (const file of files) {
  let text = fs.readFileSync(file, "utf8");
  const before = text;

  for (const [bad, good] of replacements) {
    text = text.split(bad).join(good);
  }

  // Remove unrecoverable Bengali mojibake comments.
  text = text.replace(/^\s*\/\/\s*à¦.*$/gm, "");
  text = text.replace(/\{\/\*\s*à¦[\s\S]*?\*\/\}/g, "{/* cleaned comment */}");

  if (text !== before) {
    fs.writeFileSync(file, text, "utf8");
    touched += 1;
  }
}

console.log(`Cleaned mojibake in ${touched} file(s).`);

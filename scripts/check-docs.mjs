import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = ["README.md", "public/llms.txt", ...[
  "index", "architecture", "routes", "features", "api", "data-model", "security", "testing", "deployment", "operations", "accessibility-and-performance", "contributing", "troubleshooting", "production-readiness"
].map((name) => `docs/${name}.md`)];
const failures = [];
for (const file of required) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) failures.push(`Missing required document: ${file}`);
  else if (!fs.readFileSync(full, "utf8").trim()) failures.push(`Empty document: ${file}`);
}
const markdownFiles = ["README.md", ...fs.readdirSync(path.join(root, "docs")).filter((file) => file.endsWith(".md")).map((file) => `docs/${file}`)];
for (const file of markdownFiles) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  if (!/^# /m.test(text)) failures.push(`${file}: missing level-one heading`);
  for (const match of text.matchAll(/\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
    const target = match[1];
    if (!target.startsWith("http") && !target.startsWith("mailto:") && !target.startsWith("tel:")) {
      const targetPath = target.startsWith("/")
        ? path.join(root, target.replace(/^\//, ""))
        : path.resolve(path.dirname(path.join(root, file)), target);
      if (!fs.existsSync(targetPath)) failures.push(`${file}: broken local link ${target}`);
    }
  }
  if (/Next\.js 15|next lint|Vite SPA|React \(Vite/i.test(text)) failures.push(`${file}: stale architecture reference detected`);
  if (/(JWT_SECRET|DB_PASSWORD|SMTP_PASSWORD)\s*=\s*[^<\n`]+/i.test(text)) failures.push(`${file}: possible secret assignment detected`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Documentation check passed: ${required.length} required files, links, stale-reference, and secret-pattern checks.`);

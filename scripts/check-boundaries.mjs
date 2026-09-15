import { readFile, readdir } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = resolve(projectRoot, "src");
const importPattern = /(?:from\s+|import\s*\(\s*|import\s+)["']([^"']+)["']/g;
const forbiddenExternal = /^(next(?:\/|$)|react(?:\/|$)|@supabase\/|postgres(?:\/|$))/;

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) return sourceFiles(path);
      return [".ts", ".tsx"].includes(extname(path)) ? [path] : [];
    }),
  );
  return nested.flat();
}

function layer(path) {
  const local = relative(sourceRoot, path).replaceAll("\\", "/");
  return local.split("/")[0];
}

function resolvedTarget(source, specifier) {
  if (!specifier.startsWith(".")) return undefined;
  return resolve(dirname(source), specifier);
}

const violations = [];
for (const file of await sourceFiles(sourceRoot)) {
  const sourceLayer = layer(file);
  if (!new Set(["domain", "application"]).has(sourceLayer)) continue;

  const content = await readFile(file, "utf8");
  for (const match of content.matchAll(importPattern)) {
    const specifier = match[1];
    const target = resolvedTarget(file, specifier);
    const targetLayer = target?.startsWith(sourceRoot) ? layer(target) : undefined;

    if (sourceLayer === "domain") {
      if (forbiddenExternal.test(specifier) || (targetLayer && targetLayer !== "domain")) {
        violations.push(`${relative(projectRoot, file)} -> ${specifier}`);
      }
    }

    if (sourceLayer === "application") {
      if (
        forbiddenExternal.test(specifier) ||
        (targetLayer && ["infrastructure", "server", "app"].includes(targetLayer))
      ) {
        violations.push(`${relative(projectRoot, file)} -> ${specifier}`);
      }
    }
  }
}

if (violations.length > 0) {
  process.stderr.write(`Import boundaries violated:\n${violations.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write("Import boundaries: PASS\n");
}

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const writeDist = process.argv.includes("--write-dist");
const schema = "https://ui.shadcn.com/schema/registry.json";

function readJson(relativePath) {
  const absolutePath = path.resolve(root, relativePath);
  try {
    return JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    throw new Error(`invalid JSON in ${relativePath}: ${error.message}`);
  }
}

function assertFile(relativePath) {
  const absolutePath = path.resolve(root, relativePath);
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    throw new Error(`missing file: ${relativePath}`);
  }
}

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function resolveRegistry(relativePath, allItems, seenNames, stack = []) {
  assertFile(relativePath);
  const registry = readJson(relativePath);
  const registryDir = path.dirname(relativePath);

  if (registry.$schema !== schema) {
    throw new Error(`${relativePath} must use schema ${schema}`);
  }

  for (const includePath of registry.include || []) {
    const resolved = toPosix(path.normalize(path.join(registryDir, includePath)));
    if (stack.includes(resolved)) {
      throw new Error(`registry include cycle: ${[...stack, resolved].join(" -> ")}`);
    }
    resolveRegistry(resolved, allItems, seenNames, [...stack, relativePath]);
  }

  for (const item of registry.items || []) {
    if (!item.name || !/^[a-z0-9-]+$/.test(item.name)) {
      throw new Error(`${relativePath} has invalid item name: ${item.name}`);
    }
    if (seenNames.has(item.name)) {
      throw new Error(`duplicate registry item name: ${item.name}`);
    }
    if (item.type !== "registry:item") {
      throw new Error(`${item.name} must use type registry:item`);
    }
    if (item.registryDependencies !== undefined) {
      if (!Array.isArray(item.registryDependencies)) {
        throw new Error(`${item.name} registryDependencies must be an array`);
      }
      for (const dependency of item.registryDependencies) {
        if (typeof dependency !== "string" || dependency.trim() === "") {
          throw new Error(`${item.name} registryDependencies must contain non-empty strings`);
        }
      }
    }

    const files = item.files || [];
    if (files.length === 0) {
      throw new Error(`${item.name} must include files`);
    }

    const normalizedFiles = files.map((file) => {
      if (file.type !== "registry:file") {
        throw new Error(`${item.name} file ${file.path} must use type registry:file`);
      }
      if (!file.target || !file.target.startsWith("~/")) {
        throw new Error(`${item.name} file ${file.path} must use a ~/ target`);
      }

      const resolvedPath = toPosix(path.normalize(path.join(registryDir, file.path)));
      assertFile(resolvedPath);
      return {
        ...file,
        path: resolvedPath,
      };
    });

    seenNames.add(item.name);
    allItems.push({
      ...item,
      files: normalizedFiles,
      _source: relativePath,
    });
  }
}

function validateSkillManifests() {
  for (const skillDir of fs.readdirSync(path.resolve(root, "skills")).sort()) {
    const manifestPath = `skills/${skillDir}/manifest.json`;
    assertFile(manifestPath);
    const manifest = readJson(manifestPath);

    if (manifest.name !== skillDir) {
      throw new Error(`${manifestPath} name must match directory ${skillDir}`);
    }
    if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
      throw new Error(`${manifestPath} version must be semver`);
    }

    const referencedFiles = [
      manifest.entrypoints?.generic,
      manifest.entrypoints?.codex,
      manifest.entrypoints?.openai_ui,
      ...(manifest.prompts || []),
      ...(manifest.examples || []),
    ].filter(Boolean);

    for (const file of referencedFiles) {
      assertFile(`skills/${skillDir}/${file}`);
    }
  }
}

const rootRegistry = readJson("registry.json");
if (!rootRegistry.name) {
  throw new Error("registry.json name missing");
}
if (!rootRegistry.include || rootRegistry.include.length === 0) {
  throw new Error("registry.json must include at least one nested registry");
}

const items = [];
resolveRegistry("registry.json", items, new Set());
validateSkillManifests();

const itemNames = new Set(items.map((item) => item.name));
for (const item of items) {
  for (const dependency of item.registryDependencies || []) {
    const match = dependency.match(/^liyown\/skills-registry\/([a-z0-9-]+)(?:#.+)?$/);
    if (match && !itemNames.has(match[1])) {
      throw new Error(`${item.name} depends on missing local item: ${dependency}`);
    }
  }
}

if (writeDist) {
  const distDir = path.resolve(root, "dist");
  const itemDir = path.join(distDir, "items");
  fs.mkdirSync(itemDir, { recursive: true });

  const flatItems = items.map(({ _source, ...item }) => item);
  fs.writeFileSync(
    path.join(distDir, "registry.json"),
    JSON.stringify(
      {
        $schema: schema,
        name: rootRegistry.name,
        homepage: rootRegistry.homepage,
        items: flatItems,
      },
      null,
      2,
    ) + "\n",
  );

  for (const item of flatItems) {
    fs.writeFileSync(path.join(itemDir, `${item.name}.json`), JSON.stringify(item, null, 2) + "\n");
  }
}

console.log(`registry validation passed: ${items.length} item(s)`);

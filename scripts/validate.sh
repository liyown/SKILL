#!/usr/bin/env sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"

required_files="
SKILL.md
skill.md
manifest.json
README.md
LICENSE
agents/openai.yaml
prompts/reviewer.md
prompts/spring-reviewer.md
prompts/mybatis-reviewer.md
prompts/security-reviewer.md
examples/bad-service.java
examples/pr-diff-example.diff
examples/review-output.md
"

for file in $required_files; do
  if [ ! -s "$file" ]; then
    echo "missing or empty: $file" >&2
    exit 1
  fi
done

ruby -e '
require "yaml"
content = File.read("SKILL.md")
frontmatter = content.match(/\A---\n(.*?)\n---/m)
abort("SKILL.md frontmatter missing") unless frontmatter
data = YAML.safe_load(frontmatter[1])
abort("SKILL.md name missing") unless data["name"] == "java-code-reviewer"
abort("SKILL.md description missing") unless data["description"].to_s.length > 40
YAML.safe_load(File.read("agents/openai.yaml"))
'

node -e '
const fs = require("fs");
const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
if (manifest.name !== "java-code-reviewer") throw new Error("manifest name mismatch");
if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) throw new Error("manifest version must be semver");
for (const file of [manifest.entrypoints.generic, manifest.entrypoints.codex, ...manifest.prompts, ...manifest.examples]) {
  if (!fs.existsSync(file)) throw new Error(`manifest references missing file: ${file}`);
}
'

echo "validation passed"

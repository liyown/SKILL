#!/usr/bin/env sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"

for file in registry.json README.md LICENSE package.json; do
  if [ ! -s "$file" ]; then
    echo "missing or empty: $file" >&2
    exit 1
  fi
done

node scripts/validate-registry.mjs

ruby -e '
require "yaml"

Dir["skills/*/SKILL.md"].sort.each do |file|
  content = File.read(file)
  frontmatter = content.match(/\A---\n(.*?)\n---/m)
  abort("#{file} frontmatter missing") unless frontmatter
  data = YAML.safe_load(frontmatter[1])
  abort("#{file} name missing") unless data["name"].to_s.length > 0
  abort("#{file} description missing") unless data["description"].to_s.length > 40
end

Dir["skills/*/agents/openai.yaml"].sort.each do |file|
  YAML.safe_load(File.read(file))
end
'

echo "validation passed"

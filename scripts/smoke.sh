#!/usr/bin/env sh
# Smoke test for the skill CLI consumer model.
#
# Asserts that every skill in this repository would be discoverable and
# parseable by the `npx skills` consumer pipeline:
#
#   1. skills/<name>/SKILL.md exists
#   2. frontmatter opens with `---` and closes with `---`
#   3. frontmatter name equals the directory name
#   4. frontmatter description is non-empty and ≥ 40 chars
#   5. SKILL.md body references to prompts/<file>.md resolve to real files
#   6. SKILL.md body references to examples/<file> resolve to real files
#
# This is intentionally conservative: it only checks what we can verify
# without running the CLI. It catches the most common breakage (typo in a
# prompt file name, missing frontmatter name) before a consumer ever sees
# the skill.

set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"

errors=0
fail() {
    echo "FAIL: $1" >&2
    errors=$((errors + 1))
}

# Extract a top-level frontmatter field's value. Strips surrounding quotes
# if present. Multi-line values are not supported (matches what `npx skills`
# consumers parse in practice).
frontmatter_field() {
    file="$1"
    field="$2"
    sed -n '/^---$/,/^---$/p' "$file" \
        | grep -E "^${field}:" \
        | head -1 \
        | sed -e "s/^${field}:[[:space:]]*//" \
              -e 's/^"\(.*\)"$/\1/' \
              -e "s/^'\(.*\)'$/\1/"
}

check_skill() {
    skill_dir="$1"
    name=$(basename "$skill_dir")
    skill_md="$skill_dir/SKILL.md"

    if [ ! -f "$skill_md" ]; then
        fail "$skill_dir missing SKILL.md (required entrypoint)"
        return
    fi

    # Frontmatter must open and close
    open=$(head -1 "$skill_md")
    if [ "$open" != "---" ]; then
        fail "$skill_md must start with ---"
        return
    fi
    if ! sed -n '2,$p' "$skill_md" | grep -q '^---$'; then
        fail "$skill_md frontmatter is not closed with ---"
        return
    fi

    fm_name=$(frontmatter_field "$skill_md" name)
    fm_desc=$(frontmatter_field "$skill_md" description)

    if [ -z "$fm_name" ]; then
        fail "$skill_md frontmatter 'name' is missing"
    elif [ "$fm_name" != "$name" ]; then
        fail "$skill_md frontmatter name '$fm_name' does not match directory '$name'"
    fi

    if [ -z "$fm_desc" ]; then
        fail "$skill_md frontmatter 'description' is missing"
    else
        desc_len=${#fm_desc}
        if [ "$desc_len" -lt 40 ]; then
            fail "$skill_md frontmatter 'description' is $desc_len chars; need ≥ 40"
        fi
    fi

    # Path references in the body must resolve
    body=$(sed -n '/^---$/,$p' "$skill_md" | tail -n +2)
    refs=$(echo "$body" \
        | grep -oE '`?prompts/[a-zA-Z0-9._-]+\.md`?' \
        | sed -E 's/^`?prompts\///;s/`?$//' \
        | sort -u)
    for ref in $refs; do
        if [ ! -f "$skill_dir/prompts/$ref" ]; then
            fail "$skill_md references prompts/$ref but file does not exist"
        fi
    done

    examples_refs=$(echo "$body" \
        | grep -oE '`?examples/[a-zA-Z0-9._/-]+`?' \
        | sed -E 's/^`?examples\///;s/`?$//' \
        | sort -u)
    for ref in $examples_refs; do
        if [ ! -f "$skill_dir/examples/$ref" ]; then
            fail "$skill_md references examples/$ref but file does not exist"
        fi
    done
}

for skill_dir in skills/*/; do
    check_skill "$skill_dir"
done

if [ "$errors" -gt 0 ]; then
    echo >&2
    echo "$errors smoke check(s) failed" >&2
    exit 1
fi

echo "smoke check passed"

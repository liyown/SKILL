#!/usr/bin/env sh
# Sanity check for skill examples.
#
# This is NOT a compiler or linter — it is a structural assertion that runs
# without external toolchains (no go, no javac, no tsc required). It enforces
# the contributor contract documented in CONTRIBUTING.md:
#
#   1. Every examples/bad-<file> has a matching examples/good-<file>
#   2. Every good-<file> is non-trivial (≥ 30 lines) and self-identifies as
#      a "good counterpart" near the top
#   3. No stray non-conforming filenames in examples/ (bad-*, good-*, pr-*-diff,
#      review-output.md, or known workflow skill outputs)
#   4. Every reviewer skill has a review-output.md (or equivalent) sample
#
# Exit non-zero on the first violation. Use as a local pre-merge check or as
# a CI step.

set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"

errors=0
fail() {
    echo "FAIL: $1" >&2
    errors=$((errors + 1))
}

check_reviewer_skill() {
    skill_dir="$1"
    examples_dir="$skill_dir/examples"
    [ -d "$examples_dir" ] || return 0

    # Find reviewer skills by presence of prompts/reviewer.md.
    [ -f "$skill_dir/prompts/reviewer.md" ] || return 0

    bad_count=0
    good_count=0
    has_review_output=0
    stray=0

    for f in "$examples_dir"/*; do
        [ -f "$f" ] || continue
        name=$(basename "$f")
        case "$name" in
            bad-*)
                bad_count=$((bad_count + 1))
                good_name="good-${name#bad-}"
                if [ ! -f "$examples_dir/$good_name" ]; then
                    fail "$examples_dir/$name has no matching $good_name"
                fi
                ;;
            good-*)
                good_count=$((good_count + 1))
                lines=$(wc -l < "$f" | tr -d ' ')
                # Full-file examples (good-service.*) must be substantial;
                # single-focus good examples can be a tight patch.
                case "$name" in
                    good-service.*) min_lines=30 ;;
                    *) min_lines=5 ;;
                esac
                if [ "$lines" -lt "$min_lines" ]; then
                    fail "$f is only $lines lines; expected ≥ $min_lines (real fixes are not trivial)"
                fi
                if ! head -20 "$f" | grep -qiE 'good.{0,12}counterpart|good.{0,12}version|good.{0,12}example|good.{0,12}form|good.{0,12}equivalent|fixes? .*bad'; then
                    fail "$f missing 'Good counterpart of ...' marker in first 20 lines"
                fi
                ;;
            review-output.md)
                has_review_output=1
                ;;
            pr-diff-example.diff|workflow-note.md|knowledge-note.md)
                # known non-bad/good files; not a stray
                ;;
            *.java|*.go|*.tsx|*.ts|*.diff|*.kt|*.swift|*.py|*.rb|*.rs)
                # Standalone single-focus example (e.g. transaction-self-invocation.java).
                # Must be paired with a good- file of the same stem, unless the
                # issue is already covered in examples/good-service.*.
                stem="${name%.*}"
                ext="${name##*.}"
                has_pair=0
                for good in "$examples_dir/good-$stem.$ext" "$examples_dir/good-service.$ext"; do
                    if [ -f "$good" ]; then
                        has_pair=1
                        break
                    fi
                done
                if [ "$has_pair" -eq 0 ]; then
                    fail "$examples_dir/$name has no good-* counterpart (need good-$name or good-service.$ext)"
                fi
                ;;
            *)
                fail "$examples_dir/$name does not follow bad-* / good-* / review-output.md naming"
                ;;
        esac
    done

    if [ "$bad_count" -eq 0 ]; then
        fail "$skill_dir has no examples/bad-* files (a reviewer with no bad example has nothing to teach)"
    fi
    if [ "$good_count" -eq 0 ]; then
        fail "$skill_dir has no examples/good-* files (every bad example must be paired with a fix)"
    fi
    if [ "$has_review_output" -eq 0 ]; then
        fail "$skill_dir is missing examples/review-output.md (needed as the canonical output contract sample)"
    fi
}

for skill_dir in skills/*/; do
    check_reviewer_skill "$skill_dir"
done

if [ "$errors" -gt 0 ]; then
    echo >&2
    echo "$errors check(s) failed" >&2
    exit 1
fi

echo "examples check passed"

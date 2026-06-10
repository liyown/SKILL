#!/usr/bin/env sh
# Cut a release of this skills registry.
#
# Steps performed (idempotent where possible):
#   1. read the current version from `git describe --tags` (vX.Y.Z-N-gHASH)
#   2. derive the next version from the most recent annotated tag:
#        - if the working tree is dirty: fail
#        - if there are no commits since the tag: HEAD is already tagged
#        - else: bump per `--bump-mode` (default patch, or `--minor` /
#               `--major` / `--bump X.Y.Z`)
#   3. run ./scripts/validate.sh; abort on failure
#   4. ask for confirmation (unless --yes is passed)
#   5. create an annotated tag `v<version>` at HEAD
#   6. push the tag and the current branch to origin (unless --no-publish)
#   7. print the new tag and the gh release create command
#
# Flags:
#   --yes  / -y    skip the interactive confirmation prompt
#   --dry-run      print every action that would be taken, run validate,
#                  but do NOT create the tag, do NOT push
#   --notes-from <file>  read this file as the GitHub release notes body. The
#                        script does not publish to GitHub itself; pipe the file
#                        to `gh release create --notes-file` yourself.
#   --no-publish      do not push the tag or branch to origin (local-only release)
#   --bump-mode patch|minor|major
#                        default patch. minor => v0.3.6 -> v0.4.0
#                        major => v0.3.6 -> v1.0.0
#   --bump X.Y.Z   override the auto-bumped version entirely (validated to
#                  be > the current tag's version)
#   --help / -h    print this help and exit
#
# The script does NOT bump any version file (this repo has no package.json
# or similar); the source of truth is the git tag. The README's
# "Latest Release" section must already be in sync with the tag — the
# script does not edit it.

set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
cd "$ROOT"

print_help() {
    sed -n '2,/^$/p' "$0" | sed 's/^# \{0,1\}//'
}

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
    print_help
    exit 0
fi

YES=""
DRY_RUN=""
BUMP_OVERRIDE=""
BUMP_MODE="patch"
NOTES_FROM=""
NO_PUBLISH=""
while [ $# -gt 0 ]; do
    case "$1" in
        --yes|-y) YES=1 ;;
        --dry-run) DRY_RUN=1 ;;
        --bump) BUMP_OVERRIDE="$2"; shift ;;
        --bump=*) BUMP_OVERRIDE="${1#--bump=}" ;;
        --bump-mode) BUMP_MODE="$2"; shift ;;
        --bump-mode=*) BUMP_MODE="${1#--bump-mode=}" ;;
        --notes-from) NOTES_FROM="$2"; shift ;;
        --notes-from=*) NOTES_FROM="${1#--notes-from=}" ;;
        --no-publish) NO_PUBLISH=1 ;;
        --help|-h) print_help; exit 0 ;;
        *) echo "unknown flag: $1" >&2; exit 1 ;;
    esac
    shift
done

# Validate bump-mode
case "$BUMP_MODE" in
    patch|minor|major) ;;
    *) echo "FAIL: --bump-mode must be patch, minor, or major (got $BUMP_MODE)" >&2; exit 1 ;;
esac

# If --bump X.Y.Z is set, it overrides --bump-mode entirely
if [ -n "$BUMP_OVERRIDE" ]; then
    BUMP_MODE="explicit"
fi

# 1. current state
if [ -n "$(git status --porcelain)" ]; then
    echo "FAIL: working tree is dirty; commit or stash first" >&2
    exit 1
fi

CURRENT_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
HEAD_SHA=$(git rev-parse --short HEAD)

# If no annotated tag exists yet, the first release must be specified
# explicitly with --bump. Auto-bumping from a missing tag would guess wrong
# (v0.0.0 -> v0.0.1 by default is almost never what a fresh repo wants).
if [ -z "$CURRENT_TAG" ]; then
    if [ -z "$BUMP_OVERRIDE" ]; then
        echo "FAIL: no annotated tag exists yet; pass --bump vX.Y.Z for the first release" >&2
        exit 1
    fi
    CURRENT_TAG="(none)"
    # Count all commits from the root for the first release
    COMMITS_SINCE=$(git rev-list --count HEAD)
else
    COMMITS_SINCE=$(git rev-list --count "${CURRENT_TAG}..HEAD")
fi

echo "current tag : $CURRENT_TAG"
echo "HEAD        : $HEAD_SHA"
echo "commits since: $COMMITS_SINCE"
echo "bump mode   : $BUMP_MODE"

# 2. derive next version
case "$COMMITS_SINCE" in
    0)
        # Only relevant when a real tag existed before; with no prior tag the
        # auto-bump path is unreachable (we require --bump above).
        echo "HEAD is already tagged at $CURRENT_TAG; nothing to release"
        exit 0
        ;;
    *)
        if [ -n "$BUMP_OVERRIDE" ]; then
            NEXT_TAG="v$BUMP_OVERRIDE"
            case "$NEXT_TAG" in
                "$CURRENT_TAG") echo "FAIL: --bump $BUMP_OVERRIDE equals current tag $CURRENT_TAG" >&2; exit 1 ;;
                v*) ;;
                *) echo "FAIL: --bump must look like vX.Y.Z (got $BUMP_OVERRIDE)" >&2; exit 1 ;;
            esac
            if [ "$NEXT_TAG" \< "$CURRENT_TAG" ] || [ "$NEXT_TAG" = "$CURRENT_TAG" ]; then
                echo "FAIL: --bump $NEXT_TAG must be greater than current tag $CURRENT_TAG" >&2
                exit 1
            fi
        else
            base=${CURRENT_TAG#v}
            major=$(echo "$base" | cut -d. -f1)
            minor=$(echo "$base" | cut -d. -f2)
            patch=$(echo "$base" | cut -d. -f3)
            case "$BUMP_MODE" in
                patch)
                    next_patch=$((patch + 1))
                    NEXT_TAG="v${major}.${minor}.${next_patch}"
                    ;;
                minor)
                    next_minor=$((minor + 1))
                    NEXT_TAG="v${major}.${next_minor}.0"
                    ;;
                major)
                    next_major=$((major + 1))
                    NEXT_TAG="v${next_major}.0.0"
                    ;;
            esac
        fi
        ;;
esac

# 3. validate
./scripts/validate.sh

# 4. confirm
echo
echo "about to tag $NEXT_TAG at $HEAD_SHA (mode: $BUMP_MODE)"
echo "  message: \"Release $NEXT_TAG (auto-generated; $COMMITS_SINCE commits since $CURRENT_TAG)\""
echo

if [ -n "$DRY_RUN" ]; then
    echo "DRY RUN: would run:"
    echo "  git tag -a $NEXT_TAG -m \"Release $NEXT_TAG (auto-generated; $COMMITS_SINCE commits since $CURRENT_TAG)\""
    if [ -n "$NO_PUBLISH" ]; then
        echo "  (would skip push: --no-publish set; tag stays local)"
    else
        echo "  git push origin HEAD"
        echo "  git push origin $NEXT_TAG"
    fi
    if [ -n "$NOTES_FROM" ]; then
        echo "  gh release create $NEXT_TAG --notes-file $NOTES_FROM (not part of this script)"
    fi
    echo
    echo "DRY RUN: no tag created, no push performed"
    exit 0
fi

if [ -n "$NOTES_FROM" ] && [ ! -f "$NOTES_FROM" ]; then
    echo "FAIL: --notes-from $NOTES_FROM does not exist or is not a regular file" >&2
    exit 1
fi

if [ -z "$YES" ]; then
    printf "continue? [y/N] "
    read -r ans
    case "$ans" in
        y|Y|yes|YES) ;;
        *) echo "aborted"; exit 1 ;;
    esac
fi

# 5. tag
git tag -a "$NEXT_TAG" -m "Release $NEXT_TAG

Auto-generated by scripts/release.sh. $COMMITS_SINCE commits since
$CURRENT_TAG.

Edit this annotation before pushing if you want a hand-written release
note; re-run with --yes after editing."

# 6. push
if [ -n "$NO_PUBLISH" ]; then
    echo "skipping push (--no-publish): tag $NEXT_TAG is local only"
    echo "  inspect: git show $NEXT_TAG"
    echo "  publish later with: git push origin HEAD && git push origin $NEXT_TAG"
    exit 0
fi
git push origin HEAD
git push origin "$NEXT_TAG"

# 7. echo
echo
echo "released: $NEXT_TAG"
echo "  inspect: git show $NEXT_TAG"
echo "  browse: https://github.com/liyown/skills-registry/releases/tag/$NEXT_TAG"
if [ -n "$NOTES_FROM" ]; then
    echo
    echo "release notes file is at: $NOTES_FROM"
    echo "publish to GitHub with:"
    echo "  gh release create $NEXT_TAG --title \"$NEXT_TAG\" --notes-file $NOTES_FROM --target main"
fi

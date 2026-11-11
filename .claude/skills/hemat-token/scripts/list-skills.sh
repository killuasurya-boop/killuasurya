#!/usr/bin/env bash
# Cetak "nama — deskripsi" tiap skill (repo + pribadi), hemat token: hanya frontmatter.
for dir in "${CLAUDE_PROJECT_DIR:-.}/.claude/skills" "$HOME/.claude/skills"; do
  [ -d "$dir" ] || continue
  echo "## $dir"
  for f in "$dir"/*/SKILL.md; do
    [ -f "$f" ] || continue
    awk '
      /^---$/ { n++; next }
      n==1 && /^name:/ { sub(/^name:[ ]*/,""); name=$0 }
      n==1 && /^description:/ { sub(/^description:[ ]*/,""); desc=substr($0,1,160) }
      n>=2 { exit }
      END { printf "- %s — %s\n", name, desc }
    ' "$f"
  done
done

#!/bin/sh
# Deploy Coolify apps on cthgpu by hand. The GitHub push webhooks are off since 2026-10-21
# (coolify.scsnake.xyz is no longer public), so a push to `staging` builds nothing by itself.
# The API call runs on cthgpu over ssh: Coolify accepts it from cthgpu's Tailscale IP, and the
# token (COOLIFY_TOKEN in ~/.env) is there too.
# Usage: git push origin main:staging && scripts/deploy.sh staging
#        scripts/deploy.sh math piano          # some staging apps
#        scripts/deploy.sh chinese-writing     # 國字注音 (scsnake/ChineseWriting, main)
set -eu

uuid() {
  case "$1" in
    portal) echo ogs0wwc8c8okowk8c4kgcw08 ;;
    math) echo ncc4gs8c8kcc88w04osccccc ;;
    onestroke) echo n4gwgokgk4ko40ocgows0048 ;;
    piano) echo nsk0k8cwg08cg0sog4c44g0s ;;
    writer) echo agco0okk4w0s488ows4gswok ;;
    tech) echo akwcwcgs84o0ckks40osk4gk ;;
    chinese-writing) echo d8w084w8sogwsk0kkog404gs ;;
    *) echo "unknown app: $1 (portal math onestroke piano writer tech chinese-writing, or staging)" >&2; exit 2 ;;
  esac
}

[ $# -gt 0 ] || { sed -n '6,8p' "$0"; exit 2; }
[ "$1" = staging ] && set -- portal math onestroke piano writer tech

uuids=""
for app in "$@"; do uuids="$uuids${uuids:+,}$(uuid "$app")"; done

ssh -x cthgpu "TOK=\$(grep '^COOLIFY_TOKEN=' ~/.env | cut -d= -f2-) &&
  curl -sS -m 30 -X POST -H \"Authorization: Bearer \$TOK\" 'http://100.68.55.39:8000/api/v1/deploy?uuid=$uuids'"
echo

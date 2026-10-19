#!/usr/bin/env python3
"""Provision Cloudflare Pages projects for the kids-portal monorepo (replaces the Coolify setup).

Usage:
    # Token needs: Account → Cloudflare Pages: Edit, and Zone → DNS: Edit (scsnake.xyz).
    # The Cloudflare Pages GitHub app must be allowed to see scsnake/kids-portal
    # (dashboard → Workers & Pages → Create → Pages → Connect to Git, once).
    export CF_API_TOKEN=$(grep '^CF_API_TOKEN=' ~/.env | cut -d= -f2-)

    python3 scripts/provision_pages.py kids-tech                 # project + preview domain
    python3 scripts/provision_pages.py kids-tech --cutover       # point the real domain at Pages
    python3 scripts/provision_pages.py kids-tech --rollback      # point it back at the tunnel

Steps for each app:
  1. Create the Pages project (Git-connected; builds only when its folder changes).
  2. Add the preview domain (<slug>-preview.scsnake.xyz) with a proxied CNAME to <project>.pages.dev.
  3. --cutover: add the real domain to the project and repoint its DNS record from the
     tunnel to <project>.pages.dev. --rollback repoints it to the tunnel.

Idempotent: existing projects, domains and records are left as they are. The tunnel's
public hostname and the Coolify app are not touched, so --rollback is one DNS change.
"""

import json
import os
import sys
import urllib.error
import urllib.request

# ── CONFIG ─────────────────────────────────────────────────────────────────
ACCOUNT_ID = "ee7119b55f3837c47a69d45968c66b2a"
ZONE_ID = "77f2903d9f34fcd75875e97f585d2f66"
OWNER, REPO, BRANCH = "scsnake", "kids-portal", "main"
TUNNEL_TARGET = "781c739c-84a3-40f6-a20e-6a6325a38b6b.cfargotunnel.com"

APPS = {
    "kids-portal": {"root": "portal", "domain": "kids.scsnake.xyz"},
    "kids-math": {"root": "apps/math-practice", "domain": "kids-math.scsnake.xyz"},
    "kids-piano": {"root": "apps/piano-sightreader", "domain": "kids-piano.scsnake.xyz"},
    "kids-onestroke": {"root": "apps/one-stroke", "domain": "kids-onestroke.scsnake.xyz"},
    "kids-writer": {"root": "apps/little-writer", "domain": "kids-writer.scsnake.xyz"},
    "kids-tech": {"root": "apps/tech-explorer", "domain": "kids-tech.scsnake.xyz"},
}
# ───────────────────────────────────────────────────────────────────────────

TOKEN = os.environ.get("CF_API_TOKEN")
API = "https://api.cloudflare.com/client/v4"


def call(method, path, body=None):
    req = urllib.request.Request(
        API + path,
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": f"Bearer {TOKEN}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        return json.load(e)


def must(res, what):
    if not res.get("success"):
        errs = "; ".join(f"{e.get('code')}: {e.get('message')}" for e in res.get("errors", []))
        sys.exit(f"✗ {what} failed — {errs}")
    return res["result"]


def ensure_project(name, root):
    base = f"/accounts/{ACCOUNT_ID}/pages/projects"
    got = call("GET", f"{base}/{name}")
    if got.get("success"):
        print(f"• project {name} exists")
        return got["result"]
    body = {
        "name": name,
        "production_branch": BRANCH,
        "build_config": {"build_command": "", "destination_dir": "", "root_dir": root},
        "source": {
            "type": "github",
            "config": {
                "owner": OWNER,
                "repo_name": REPO,
                "production_branch": BRANCH,
                "deployments_enabled": True,
                "production_deployments_enabled": True,
                "preview_deployment_setting": "none",
                # build only when this app's folder changes
                "path_includes": [f"{root}/*"],
            },
        },
    }
    proj = must(call("POST", base, body), f"create project {name}")
    print(f"✓ created project {name} → {proj.get('subdomain')}")
    return proj


def ensure_domain(name, host):
    base = f"/accounts/{ACCOUNT_ID}/pages/projects/{name}/domains"
    have = {d["name"] for d in must(call("GET", base), "list domains")}
    if host in have:
        print(f"• domain {host} already on {name}")
        return
    must(call("POST", base, {"name": host}), f"add domain {host}")
    print(f"✓ added domain {host} to {name}")


def point_dns(host, target):
    recs = must(call("GET", f"/zones/{ZONE_ID}/dns_records?name={host}"), "find DNS record")
    body = {"type": "CNAME", "name": host, "content": target, "proxied": True, "ttl": 1}
    if recs:
        rec = recs[0]
        if rec["type"] == "CNAME" and rec["content"] == target:
            print(f"• {host} already → {target}")
            return
        must(call("PUT", f"/zones/{ZONE_ID}/dns_records/{rec['id']}", body), f"update {host}")
        print(f"✓ {host}: {rec['content']} → {target}")
    else:
        must(call("POST", f"/zones/{ZONE_ID}/dns_records", body), f"create {host}")
        print(f"✓ {host} → {target} (new)")


def main():
    if not TOKEN:
        sys.exit("CF_API_TOKEN is not set")
    args = sys.argv[1:]
    names = [a for a in args if not a.startswith("--")]
    if not names or any(n not in APPS for n in names):
        sys.exit(f"usage: provision_pages.py <{'|'.join(APPS)}> [--cutover|--rollback]")
    for name in names:
        app = APPS[name]
        pages_host = f"{name}.pages.dev"
        if "--rollback" in args:
            point_dns(app["domain"], TUNNEL_TARGET)
            continue
        ensure_project(name, app["root"])
        preview = app["domain"].replace(".scsnake.xyz", "-preview.scsnake.xyz", 1)
        ensure_domain(name, preview)
        point_dns(preview, pages_host)
        if "--cutover" in args:
            ensure_domain(name, app["domain"])
            point_dns(app["domain"], pages_host)


if __name__ == "__main__":
    main()

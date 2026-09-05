#!/usr/bin/env python3
"""Provision 4 Coolify static applications for the kids-portal monorepo.

Usage:
    # 1. In Coolify UI: Profile → Keys & Tokens → Create API token
    # 2. Export env vars (COOLIFY_URL points at the Coolify HTTP port; on cthgpu it's :8000)
    export COOLIFY_URL=http://cthgpu:8000
    export COOLIFY_TOKEN=xxxxxxxx
    # 3. Run — creates any app that doesn't already exist, then triggers a deploy
    python3 scripts/provision_coolify.py

Config lives in this file (the APPS list). Add rows or tweak domains here.

The script:
  1. Auto-discovers your server UUID, GitHub App source UUID, and project UUID
     (creating the project if it doesn't exist).
  2. POSTs each app to /api/v1/applications/private-github-app.
  3. Sets domain + watch paths + base/publish directory.
  4. Triggers a deploy.

Idempotent: if an app with the same name already exists in the project, it is
skipped (name-collision check). Rerun after adding a new APPS entry.
"""

import json
import os
import sys
import urllib.request
import urllib.error

# ── CONFIG ─────────────────────────────────────────────────────────────────
REPO           = "scsnake/kids-portal"   # GitHub owner/repo (must be reachable via the Coolify GitHub App)
BRANCH         = "main"
PROJECT_NAME   = "kids-portal"           # created if absent
ENVIRONMENT    = "production"
DOMAIN_ROOT    = "scsnake.xyz"           # subdomains built from this; also used to sanity-check

APPS = [
    {
        "name": "kids-portal",
        "domain": f"https://kids.{DOMAIN_ROOT}",
        "base_directory": "/portal",
        "publish_directory": "/",
        "watch_paths": "portal/**",
        "build_pack": "static",
    },
    {
        "name": "kids-math",
        "domain": f"https://kids-math.{DOMAIN_ROOT}",
        "base_directory": "/apps/math-practice",
        "publish_directory": "/",
        "watch_paths": "apps/math-practice/**",
        "build_pack": "static",
    },
    {
        "name": "kids-onestroke",
        "domain": f"https://kids-onestroke.{DOMAIN_ROOT}",
        "base_directory": "/apps/one-stroke",
        "publish_directory": "/",
        "watch_paths": "apps/one-stroke/**",
        "build_pack": "static",
        # bundle is committed to dist/, no build step needed
    },
    {
        "name": "kids-piano",
        "domain": f"https://kids-piano.{DOMAIN_ROOT}",
        "base_directory": "/apps/piano-sightreader",
        "publish_directory": "/",
        "watch_paths": "apps/piano-sightreader/**",
        "build_pack": "static",
    },
]

# ── API HELPER ─────────────────────────────────────────────────────────────
COOLIFY_URL = os.environ.get("COOLIFY_URL", "").rstrip("/")
COOLIFY_TOKEN = os.environ.get("COOLIFY_TOKEN", "")

if not COOLIFY_URL or not COOLIFY_TOKEN:
    print("ERROR: set COOLIFY_URL and COOLIFY_TOKEN env vars first.", file=sys.stderr)
    sys.exit(2)


def api(method: str, path: str, body=None):
    url = f"{COOLIFY_URL}/api/v1{path}"
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers={
            "Authorization": f"Bearer {COOLIFY_TOKEN}",
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            payload = resp.read().decode()
            return json.loads(payload) if payload else {}
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="ignore")
        print(f"HTTP {e.code} on {method} {path}: {detail}", file=sys.stderr)
        raise


# ── DISCOVERY ──────────────────────────────────────────────────────────────
def pick_server() -> str:
    servers = api("GET", "/servers")
    if not servers:
        raise SystemExit("No servers found in Coolify")
    if len(servers) == 1:
        s = servers[0]
        print(f"→ server: {s.get('name')} ({s.get('uuid')})")
        return s["uuid"]
    # Multiple — prefer the one named 'localhost' or the first
    for s in servers:
        if s.get("name", "").lower() == "localhost":
            print(f"→ server: {s['name']} ({s['uuid']})")
            return s["uuid"]
    s = servers[0]
    print(f"→ server (first of {len(servers)}): {s.get('name')} ({s.get('uuid')})")
    return s["uuid"]


def pick_github_source() -> str:
    # Endpoint name varies by Coolify version — try both.
    for path in ("/sources/github-apps", "/github-apps", "/sources"):
        try:
            items = api("GET", path)
        except urllib.error.HTTPError:
            continue
        if not items:
            continue
        # Prefer a source whose organization matches the repo owner
        owner = REPO.split("/")[0]
        for it in items:
            if it.get("organization", "").lower() == owner.lower() or it.get("name", "").lower() == owner.lower():
                print(f"→ github source: {it.get('name')} ({it.get('uuid')})")
                return it["uuid"]
        it = items[0]
        print(f"→ github source (first): {it.get('name')} ({it.get('uuid')})")
        return it["uuid"]
    raise SystemExit(
        "Could not find a GitHub App source. Install the Coolify GitHub App "
        "under Sources → GitHub Apps first, and grant it access to scsnake/kids-portal."
    )


def get_or_create_project() -> str:
    projects = api("GET", "/projects")
    for p in projects:
        if p.get("name") == PROJECT_NAME:
            print(f"→ project: {PROJECT_NAME} ({p['uuid']}) [existing]")
            return p["uuid"]
    created = api("POST", "/projects", {"name": PROJECT_NAME, "description": "Kids education monorepo"})
    print(f"→ project: {PROJECT_NAME} ({created['uuid']}) [created]")
    return created["uuid"]


def existing_app_names(project_uuid: str) -> set:
    apps = api("GET", "/applications")
    names = {a.get("name") for a in apps if a.get("project_uuid") == project_uuid}
    return names


# ── PROVISION ──────────────────────────────────────────────────────────────
def create_app(server_uuid, source_uuid, project_uuid, spec):
    body = {
        "project_uuid": project_uuid,
        "server_uuid": server_uuid,
        "environment_name": ENVIRONMENT,
        "github_app_uuid": source_uuid,
        "git_repository": REPO,
        "git_branch": BRANCH,
        "build_pack": spec["build_pack"],
        "name": spec["name"],
        "base_directory": spec["base_directory"],
        "publish_directory": spec["publish_directory"],
        "watch_paths": spec["watch_paths"],
        "domains": spec["domain"],
        "ports_exposes": "80",
        "instant_deploy": True,
    }
    resp = api("POST", "/applications/private-github-app", body)
    uuid = resp.get("uuid")
    print(f"   ✓ created {spec['name']} ({uuid}) → {spec['domain']}")
    return uuid


def main():
    print(f"Coolify: {COOLIFY_URL}")
    server_uuid = pick_server()
    source_uuid = pick_github_source()
    project_uuid = get_or_create_project()
    existing = existing_app_names(project_uuid)
    print(f"→ existing apps in project: {sorted(existing) or '(none)'}")

    for spec in APPS:
        if spec["name"] in existing:
            print(f"   ⏭  {spec['name']} already exists — skip")
            continue
        try:
            create_app(server_uuid, source_uuid, project_uuid, spec)
        except urllib.error.HTTPError:
            print(f"   ✗ failed to create {spec['name']} — see error above")

    print("\nDone. Next steps:")
    print("  1. Add Cloudflare DNS CNAMEs for each subdomain pointing at the Coolify proxy host.")
    print("  2. Wait for the initial deploys to finish (Coolify UI → Applications → Logs).")
    print("  3. Verify HTTPS at each domain (Cloudflare Universal SSL is automatic).")


if __name__ == "__main__":
    main()

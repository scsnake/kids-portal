#!/usr/bin/env python3
"""Provision 4 Coolify static applications for the kids-portal monorepo.

Usage:
    # 1. In Coolify UI: Profile → Keys & Tokens → Create API token (write scope)
    # 2. Export env (COOLIFY_URL is Coolify's HTTP port; run from cthgpu, or
    #    SSH-tunnel: `ssh -L 8000:localhost:8000 cthgpu` and use localhost:8000)
    export COOLIFY_URL=http://localhost:8000
    export COOLIFY_TOKEN=$(grep '^COOLIFY_TOKEN=' ~/.env | cut -d= -f2-)
    # 3. Run — creates any app that doesn't already exist, then triggers a deploy
    python3 scripts/provision_coolify.py

Config lives in this file (the APPS list). Add rows or tweak domains here.

The script:
  1. Auto-discovers your server UUID and project UUID (creating the project if
     it doesn't exist).
  2. POSTs each app to /api/v1/applications/public (public repo — no GitHub
     App or Deploy Key required).
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
REPO_URL       = "https://github.com/scsnake/kids-portal"  # public repo URL
BRANCH         = "main"
PROJECT_NAME   = "kids-portal"           # created if absent
ENVIRONMENT    = "production"
DOMAIN_ROOT    = "scsnake.xyz"           # subdomains built from this

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
    {
        "name": "kids-writer",
        "domain": f"https://kids-writer.{DOMAIN_ROOT}",
        "base_directory": "/apps/little-writer",
        "publish_directory": "/",
        "watch_paths": "apps/little-writer/**",
        "build_pack": "static",
        # bundle is committed to dist/, no build step needed
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


def get_or_create_project() -> str:
    projects = api("GET", "/projects")
    for p in projects:
        if p.get("name") == PROJECT_NAME:
            print(f"→ project: {PROJECT_NAME} ({p['uuid']}) [existing]")
            return p["uuid"]
    created = api("POST", "/projects", {"name": PROJECT_NAME, "description": "Kids education monorepo"})
    print(f"→ project: {PROJECT_NAME} ({created['uuid']}) [created]")
    return created["uuid"]


def existing_apps(project_uuid: str) -> tuple[set, set]:
    """(names, domains) of apps already in PROJECT_NAME/ENVIRONMENT.

    /applications items carry no project reference, so ask the environment
    for its applications instead. A brand-new project may not have the
    environment yet (404) — then nothing exists.
    """
    try:
        env = api("GET", f"/projects/{project_uuid}/{ENVIRONMENT}")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return set(), set()
        raise
    apps = env.get("applications") or []
    names = {a.get("name") for a in apps}
    domains = {d.strip() for a in apps for d in (a.get("fqdn") or "").split(",") if d.strip()}
    return names, domains


# ── PROVISION ──────────────────────────────────────────────────────────────
def create_app(server_uuid, project_uuid, spec):
    body = {
        "project_uuid": project_uuid,
        "server_uuid": server_uuid,
        "environment_name": ENVIRONMENT,
        "git_repository": REPO_URL,
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
    resp = api("POST", "/applications/public", body)
    uuid = resp.get("uuid")
    print(f"   ✓ created {spec['name']} ({uuid}) → {spec['domain']}")
    return uuid


def main():
    print(f"Coolify: {COOLIFY_URL}")
    server_uuid = pick_server()
    project_uuid = get_or_create_project()
    existing, taken_domains = existing_apps(project_uuid)
    print(f"→ existing apps in project: {sorted(existing) or '(none)'}")

    for spec in APPS:
        if spec["name"] in existing:
            print(f"   ⏭  {spec['name']} already exists — skip")
            continue
        if spec["domain"] in taken_domains:
            print(f"   ⏭  {spec['domain']} already served by another app in the project (renamed?) — skip")
            continue
        try:
            create_app(server_uuid, project_uuid, spec)
        except urllib.error.HTTPError:
            print(f"   ✗ failed to create {spec['name']} — see error above")

    print("\nDone. Next steps:")
    print("  1. Add Cloudflare DNS CNAMEs for each subdomain pointing at the Coolify proxy host.")
    print("  2. Wait for the initial deploys to finish (Coolify UI → Applications → Logs).")
    print("  3. Verify HTTPS at each domain (Cloudflare Universal SSL is automatic).")


if __name__ == "__main__":
    main()

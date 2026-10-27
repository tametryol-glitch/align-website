"""Upload rendered SFX to Supabase storage (cosmic-videos/sfx/) and register them in audio_tracks.
Reads the service key from align-web/.env.local at runtime; never prints it."""
import json
import re
import sys
import urllib.request
import urllib.error
from pathlib import Path

ENV = Path(__file__).resolve().parents[2] / ".env.local"
BUCKET = "cosmic-videos"


def load_env():
    env = {}
    for line in ENV.read_text(encoding="utf-8-sig").splitlines():
        m = re.match(r"\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$", line)
        if m:
            env[m.group(1)] = m.group(2).strip().strip('"').strip("'")
    return env


def req(method, url, key, data=None, headers=None):
    h = {"Authorization": f"Bearer {key}", "apikey": key}
    h.update(headers or {})
    r = urllib.request.Request(url, data=data, method=method, headers=h)
    try:
        with urllib.request.urlopen(r, timeout=60) as resp:
            return resp.status, resp.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()


def main(out_dir, dry=False, sort_base=0):
    env = load_env()
    base = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
    key = env["SUPABASE_SERVICE_KEY"]
    out = Path(out_dir)
    manifest = json.loads((out / "manifest.json").read_text(encoding="utf-8"))
    rows, failed = [], []
    for i, m in enumerate(manifest):
        path = f"sfx/{m['file']}"
        if not dry:
            status, body = req(
                "POST", f"{base}/storage/v1/object/{BUCKET}/{path}", key,
                data=(out / m["file"]).read_bytes(),
                headers={"Content-Type": "audio/mpeg", "x-upsert": "true", "Cache-Control": "public, max-age=31536000"},
            )
            if status not in (200, 201):
                failed.append((m["name"], status, body[:120]))
                continue
        rows.append({
            "name": m["name"], "mood": m["mood"], "kind": "sfx", "storage_path": path,
            "duration_seconds": m["duration"], "sort_order": sort_base + (i + 1) * 10, "is_active": True, "category": m["category"],
        })
    print(f"uploaded {len(rows)} / {len(manifest)}; failed {len(failed)}")
    for f in failed:
        print("  FAIL", f)
    if dry or not rows:
        return
    # idempotent: replace any earlier rows pointing at the same paths
    paths = ",".join('"%s"' % r["storage_path"] for r in rows)
    status, body = req("DELETE", f"{base}/rest/v1/audio_tracks?storage_path=in.({paths})", key)
    print("cleanup status", status)
    status, body = req(
        "POST", f"{base}/rest/v1/audio_tracks", key, data=json.dumps(rows).encode("utf-8"),
        headers={"Content-Type": "application/json", "Prefer": "return=minimal"},
    )
    print("insert status", status, body[:200] if status >= 300 else "")


if __name__ == "__main__":
    base = int(sys.argv[sys.argv.index("--sort-base") + 1]) if "--sort-base" in sys.argv else 0
    main(sys.argv[1], dry="--dry" in sys.argv, sort_base=base)

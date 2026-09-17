import urllib.request
import json
import ssl

NEON_HOST = "https://ep-wandering-voice-ax3dccyv-pooler.c-4.us-east-2.aws.neon.tech/sql"
CONN_STR = "postgresql://neondb_owner:npg_42vTohGxKSsP@ep-wandering-voice-ax3dccyv-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"

headers = {
    "Neon-Connection-String": CONN_STR,
    "Content-Type": "application/json"
}

body = json.dumps({"query": "SELECT current_database(), current_user;"}).encode("utf-8")

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(NEON_HOST, data=body, headers=headers, method="POST")

try:
    with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        print("[SUCCESS] Neon HTTP Query Result:", res)
except urllib.error.HTTPError as e:
    print(f"HTTP {e.code} Error Body:", e.read().decode("utf-8"))
except Exception as e:
    print("[ERROR]:", e)

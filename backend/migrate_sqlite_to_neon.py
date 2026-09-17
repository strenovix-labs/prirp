import sqlite3
import json
import ssl
import urllib.request
import urllib.error

NEON_HOST = "https://ep-wandering-voice-ax3dccyv-pooler.c-4.us-east-2.aws.neon.tech/sql"
CONN_STR = "postgresql://neondb_owner:npg_42vTohGxKSsP@ep-wandering-voice-ax3dccyv-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"

headers = {
    "Neon-Connection-String": CONN_STR,
    "Content-Type": "application/json"
}

def execute_neon_query(sql_query):
    body = json.dumps({"query": sql_query}).encode("utf-8")
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(NEON_HOST, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        print(f"[HTTP {e.code} Error]:", e.read().decode("utf-8"))
        return None
    except Exception as e:
        print("[ERROR]:", e)
        return None

# Read users from SQLite prip.db
sq_conn = sqlite3.connect('prip.db')
sq_cursor = sq_conn.cursor()

sq_cursor.execute("SELECT id, email, hashed_password, full_name, role, is_active, created_at FROM users")
users = sq_cursor.fetchall()

print(f"[MIGRATION] Found {len(users)} users in local SQLite prip.db")

for user in users:
    uid, email, hashed_pwd, name, role, is_active, created_at = user
    name_str = f"'{name}'" if name else "NULL"
    created_at_str = f"'{created_at}'" if created_at else "CURRENT_TIMESTAMP"
    sql = f"""
    INSERT INTO users (id, email, hashed_password, full_name, role, is_active, created_at)
    VALUES ('{uid}', '{email}', '{hashed_pwd}', {name_str}, '{role}', {'TRUE' if is_active else 'FALSE'}, {created_at_str})
    ON CONFLICT (email) DO UPDATE SET
        hashed_password = EXCLUDED.hashed_password,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;
    """
    res = execute_neon_query(sql)
    print(f" -> Migrated user {email}:", res.get("command") if res else "Failed")

print("[MIGRATION DONE] Users migrated to Neon PostgreSQL!")

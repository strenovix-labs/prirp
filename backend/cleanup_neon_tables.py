import urllib.request
import urllib.error
import json
import ssl

NEON_HOST = "https://ep-wandering-voice-ax3dccyv-pooler.c-4.us-east-2.aws.neon.tech/sql"
CONN_STR = "postgresql://neondb_owner:npg_42vTohGxKSsP@ep-wandering-voice-ax3dccyv-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"

headers = {
    "Neon-Connection-String": CONN_STR,
    "Content-Type": "application/json"
}

def execute_query(sql_query):
    body = json.dumps({"query": sql_query}).encode("utf-8")
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(NEON_HOST, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print("[ERROR]:", e)
        return None

# List of old unused tables to remove
OLD_TABLES_TO_DROP = [
    '"Address"',
    '"WebhookEvent"',
    '"RefreshToken"',
    '"CartItem"',
    '"Product"',
    '"SubscriptionPlan"',
    '"User"',
    '"Cart"',
    '"Subscription"',
    '"OrderItem"',
    '"Payment"',
    '"Order"',
    '"NewsletterSubscriber"',
    '"_prisma_migrations"'
]

print("[INIT] Cleaning up old unused tables in Neon PostgreSQL...")

drop_sql = f"DROP TABLE IF EXISTS {', '.join(OLD_TABLES_TO_DROP)} CASCADE;"
res = execute_query(drop_sql)
print("[OK] Drop Query Result:", res)

# Verify remaining active tables
verify_res = execute_query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';")
if verify_res and 'rows' in verify_res:
    tables = [r['table_name'] for r in verify_res['rows']]
    print("\n[SUCCESS] Remaining Clean Tables in Neon PostgreSQL:")
    for t in tables:
        print(f"  - {t}")

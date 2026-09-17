import urllib.request
import json
import ssl

NEON_DB_URL = "postgresql://neondb_owner:npg_42vTohGxKSsP@ep-wandering-voice-ax3dccyv-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require"

print("Testing connection options to Neon...")
try:
    import psycopg2
    conn = psycopg2.connect(NEON_DB_URL, connect_timeout=15)
    print("SUCCESS: Connected to Neon via psycopg2!")
    cur = conn.cursor()
    cur.execute("SELECT current_database(), current_user;")
    print("DB Info:", cur.fetchone())
    conn.close()
except Exception as e:
    print("Psycopg2 Direct Error:", e)

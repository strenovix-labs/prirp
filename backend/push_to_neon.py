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
    except urllib.error.HTTPError as e:
        print(f"[HTTP {e.code} Error]:", e.read().decode("utf-8"))
        return None
    except Exception as e:
        print("[ERROR]:", e)
        return None

# 1. Create Tables
print("[INIT] Creating Tables on Neon PostgreSQL...")

queries = [
    """
    CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        hashed_password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'customer',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        sku VARCHAR(64) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        category_label VARCHAR(100),
        price_usd VARCHAR(50) NOT NULL,
        numeric_price DOUBLE PRECISION NOT NULL,
        price_inr VARCHAR(50),
        tag VARCHAR(100),
        description VARCHAR(1000),
        image_url VARCHAR(500) NOT NULL,
        sizes JSONB,
        colors JSONB,
        gsm VARCHAR(100),
        stock_qty INTEGER NOT NULL DEFAULT 500,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(36) PRIMARY KEY,
        order_number VARCHAR(64) UNIQUE NOT NULL,
        user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50),
        shipping_address JSONB NOT NULL,
        subtotal DOUBLE PRECISION NOT NULL,
        discount_amount DOUBLE PRECISION NOT NULL DEFAULT 0.0,
        total_amount DOUBLE PRECISION NOT NULL,
        promo_code VARCHAR(50),
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        payment_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
        payment_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(36) PRIMARY KEY,
        order_id VARCHAR(36) REFERENCES orders(id) ON DELETE CASCADE,
        product_id VARCHAR(64) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        size VARCHAR(20) NOT NULL DEFAULT 'M',
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price DOUBLE PRECISION NOT NULL,
        name_on_jersey VARCHAR(20),
        jersey_number VARCHAR(10)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS promo_codes (
        id VARCHAR(36) PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount_percent DOUBLE PRECISION NOT NULL,
        description VARCHAR(255),
        max_uses INTEGER NOT NULL DEFAULT 1000,
        current_uses INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS vip_subscribers (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    INSERT INTO products (id, sku, name, category, category_label, price_usd, numeric_price, price_inr, tag, description, image_url, sizes, colors, gsm, stock_qty)
    VALUES 
    ('12pack', 'PRIRP-DRINK-12PK', 'PRIRP Sub-Zero Energy 12-Pack', 'drinks', 'SUB-ZERO MATRIX', '$29.99', 29.99, '₹1,999', 'STANDARD PACK', '12 cans of cold-extracted organic green tea caffeine.', '/prirplogoo.png', '["12 CANS"]', '["Matte Black Can"]', '330ML Cold Can', 1000),
    ('24pack', 'PRIRP-DRINK-24PK', 'PRIRP Sub-Zero Energy 24-Pack PRO', 'drinks', 'RECOMMENDED PRO PACK', '$54.99', 54.99, '₹3,699', 'BEST VALUE • FREE SHIPPING', '24-pack pro box with 48h cold-chain insulated dispatch.', '/prirplogoo.png', '["24 CANS"]', '["Matte Black Can"]', '330ML Cold Can', 1000),
    ('sig-tee', 'PRIRP-TEE-SIG', 'PRIRP Signature Tee', 'tees', 'CORE TEE', '$45.00', 45.0, '₹2,499', 'BESTSELLER', 'Minimalist chest typographic branding on ultra-heavy combed cotton.', '/merch/tee-signature.jpg', '["S", "M", "L", "XL"]', '["Obsidian Black"]', '260 GSM Heavyweight', 500),
    ('essential-tee', 'PRIRP-TEE-ESSENTIAL', 'PRIRP Cyber Thermal Essential Tee', 'tees', 'FLAGSHIP CAPSULE', '$48.00', 48.0, '₹2,699', 'LIMITED // 500 UNITS', 'Custom 280GSM heavyweight combed cotton featuring our liquid chrome-red energy symbol.', '/merch/featured-essential.jpg', '["S", "M", "L", "XL", "XXL"]', '["Obsidian Black"]', '280 GSM Heavyweight Organic', 500)
    ON CONFLICT (sku) DO NOTHING;
    """,
    """
    INSERT INTO promo_codes (id, code, discount_percent, description)
    VALUES 
    ('p1', 'PRIRP10', 10.0, '10% VIP Discount'),
    ('p2', 'SUBZERO', 10.0, '10% Sub-Zero Launch Discount'),
    ('p3', 'PRIRP20', 20.0, '20% VIP Drop Special')
    ON CONFLICT (code) DO NOTHING;
    """
]

for idx, q in enumerate(queries, 1):
    res = execute_query(q)
    print(f"[{idx}/8] Query Execution Result:", res.get("command") if res else "Failed")

print("\n[SUCCESS] Neon Database Tables & Seed Data Successfully Created!")

import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User
from app.models.product import Product
from app.models.promo import PromoCode

INITIAL_PRODUCTS = [
    {
        "id": "12pack",
        "sku": "PRIRP-DRINK-12PK",
        "name": "PRIRP Sub-Zero Energy 12-Pack",
        "category": "drinks",
        "categoryLabel": "SUB-ZERO MATRIX",
        "price_usd": "$29.99",
        "numeric_price": 29.99,
        "price_inr": "₹1,999",
        "tag": "STANDARD PACK",
        "description": "12 cans of cold-extracted organic green tea caffeine, 2:1 L-Theanine, and Himalayan electrolytes.",
        "image_url": "/prirplogoo.png",
        "sizes": ["12 CANS"],
        "colors": ["Matte Black Can"],
        "gsm": "330ML Cold Can",
        "stock_qty": 1000
    },
    {
        "id": "24pack",
        "sku": "PRIRP-DRINK-24PK",
        "name": "PRIRP Sub-Zero Energy 24-Pack PRO",
        "category": "drinks",
        "categoryLabel": "RECOMMENDED PRO PACK",
        "price_usd": "$54.99",
        "numeric_price": 54.99,
        "price_inr": "₹3,699",
        "tag": "BEST VALUE • FREE SHIPPING",
        "description": "24-pack pro box with 48h cold-chain insulated dispatch.",
        "image_url": "/prirplogoo.png",
        "sizes": ["24 CANS"],
        "colors": ["Matte Black Can"],
        "gsm": "330ML Cold Can",
        "stock_qty": 1000
    },
    {
        "id": "sig-tee",
        "sku": "PRIRP-TEE-SIG",
        "name": "PRIRP Signature Tee",
        "category": "tees",
        "categoryLabel": "CORE TEE",
        "price_usd": "$45.00",
        "numeric_price": 45.0,
        "price_inr": "₹2,499",
        "tag": "BESTSELLER",
        "description": "Minimalist chest typographic branding on ultra-heavy combed cotton. Built for daily wear with zero sag.",
        "image_url": "/merch/tee-signature.jpg",
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Obsidian Black", "Void Black"],
        "gsm": "260 GSM Heavyweight",
        "stock_qty": 500
    },
    {
        "id": "over-tee",
        "sku": "PRIRP-TEE-OVER",
        "name": "PRIRP Oversized Tee",
        "category": "tees",
        "categoryLabel": "STREETWEAR",
        "price_usd": "$48.00",
        "numeric_price": 48.0,
        "price_inr": "₹2,699",
        "tag": "BOXY FIT",
        "description": "Drop-shoulder relaxed silhouette with metallic chrome-red back neckline insignia. Washed vintage feel.",
        "image_url": "/merch/tee-oversized.jpg",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "colors": ["Washed Charcoal", "Matte Black"],
        "gsm": "280 GSM Vintage Wash",
        "stock_qty": 500
    },
    {
        "id": "essential-tee",
        "sku": "PRIRP-TEE-ESSENTIAL",
        "name": "PRIRP Cyber Thermal Essential Tee",
        "category": "tees",
        "categoryLabel": "FLAGSHIP CAPSULE",
        "price_usd": "$48.00",
        "numeric_price": 48.0,
        "price_inr": "₹2,699",
        "tag": "LIMITED // 500 UNITS",
        "description": "Custom 280GSM heavyweight combed cotton featuring our liquid chrome-red energy symbol, reinforced rib collar, and laser-bonded hem tags.",
        "image_url": "/merch/featured-essential.jpg",
        "sizes": ["S", "M", "L", "XL", "XXL"],
        "colors": ["Obsidian Black"],
        "gsm": "280 GSM Heavyweight Organic",
        "stock_qty": 500
    },
    {
        "id": "energy-cap",
        "sku": "PRIRP-CAP-ENG",
        "name": "PRIRP Energy Cap",
        "category": "accessories",
        "categoryLabel": "HEADWEAR",
        "price_usd": "$35.00",
        "numeric_price": 35.0,
        "price_inr": "₹1,999",
        "tag": "TACTICAL",
        "description": "6-panel technical curved brim with 3D chrome-red embroidery and metallic reflective under-visor.",
        "image_url": "/merch/cap-energy.jpg",
        "sizes": ["ONE SIZE"],
        "colors": ["Obsidian Black"],
        "gsm": "Cordura Tech Nylon",
        "stock_qty": 300
    },
    {
        "id": "train-tee",
        "sku": "PRIRP-TEE-TRAIN",
        "name": "PRIRP Training Tee",
        "category": "tees",
        "categoryLabel": "ATHLETIC",
        "price_usd": "$42.00",
        "numeric_price": 42.0,
        "price_inr": "₹2,299",
        "tag": "AERO-VENT",
        "description": "High-mobility moisture-wicking technical weave with laser-cut side ventilation and chrome-red athletic panels.",
        "image_url": "/merch/tee-training.jpg",
        "sizes": ["S", "M", "L", "XL"],
        "colors": ["Cyber Black"],
        "gsm": "180 GSM Pro-Dry",
        "stock_qty": 400
    }
]

INITIAL_PROMOS = [
    {"code": "PRIRP10", "discount_percent": 10.0, "description": "10% VIP Discount"},
    {"code": "SUBZERO", "discount_percent": 10.0, "description": "10% Sub-Zero Launch Discount"},
    {"code": "ENERGY10", "discount_percent": 10.0, "description": "10% Energy Matrix Discount"},
    {"code": "PRIRP20", "discount_percent": 20.0, "description": "20% VIP Drop Special"},
    {"code": "CREW20", "discount_percent": 20.0, "description": "20% Crew Vault Discount"}
]

async def seed_data():
    print("[INIT] Initializing Database Schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. Seed Admin User
        admin_email = "admin@prirpenergy.com"
        result_user = await session.execute(select(User).where(User.email == admin_email))
        if not result_user.scalar_one_or_none():
            admin_user = User(
                email=admin_email,
                hashed_password=get_password_hash("prirp_admin_2026"),
                full_name="PRIRP Admin",
                role="admin"
            )
            session.add(admin_user)
            print("[OK] Created Admin Account: admin@prirpenergy.com / prirp_admin_2026")

        # 2. Seed Products
        for item in INITIAL_PRODUCTS:
            result_p = await session.execute(select(Product).where(Product.sku == item["sku"]))
            if not result_p.scalar_one_or_none():
                product = Product(
                    id=item["id"],
                    sku=item["sku"],
                    name=item["name"],
                    category=item["category"],
                    category_label=item["categoryLabel"],
                    price_usd=item["price_usd"],
                    numeric_price=item["numeric_price"],
                    price_inr=item["price_inr"],
                    tag=item["tag"],
                    description=item["description"],
                    image_url=item["image_url"],
                    sizes=item["sizes"],
                    colors=item["colors"],
                    gsm=item["gsm"],
                    stock_qty=item["stock_qty"]
                )
                session.add(product)
                print(f"[OK] Seeded Product: {item['name']}")

        # 3. Seed Promo Codes
        for promo_item in INITIAL_PROMOS:
            result_pr = await session.execute(select(PromoCode).where(PromoCode.code == promo_item["code"]))
            if not result_pr.scalar_one_or_none():
                promo = PromoCode(
                    code=promo_item["code"],
                    discount_percent=promo_item["discount_percent"],
                    description=promo_item["description"]
                )
                session.add(promo)
                print(f"[OK] Seeded Promo Code: {promo_item['code']} ({promo_item['discount_percent']}%)")

        await session.commit()
        print("[SUCCESS] Database Seeding Complete!")

if __name__ == "__main__":
    asyncio.run(seed_data())

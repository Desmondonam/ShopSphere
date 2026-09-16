from decimal import Decimal

from django.core.management.base import BaseCommand

from apps.products.models import Category, Product


CATALOG = {
    "Electronics": [
        ("Wireless Noise-Cancelling Headphones", Decimal("199.99"), Decimal("149.99"), 24),
        ("Smart Fitness Watch", Decimal("129.99"), None, 40),
        ("Portable Bluetooth Speaker", Decimal("59.99"), Decimal("44.99"), 60),
        ("4K Action Camera", Decimal("249.00"), None, 15),
    ],
    "Home & Kitchen": [
        ("Stainless Steel French Press", Decimal("34.99"), None, 50),
        ("Non-Stick Cookware Set (10-piece)", Decimal("149.99"), Decimal("119.99"), 20),
        ("Robot Vacuum Cleaner", Decimal("299.99"), Decimal("249.99"), 12),
    ],
    "Fashion": [
        ("Classic Leather Backpack", Decimal("89.99"), None, 35),
        ("Unisex Running Sneakers", Decimal("74.99"), Decimal("59.99"), 45),
        ("Polarized Sunglasses", Decimal("39.99"), None, 70),
    ],
    "Books": [
        ("The Pragmatic Programmer", Decimal("42.00"), Decimal("29.99"), 30),
        ("Atomic Habits", Decimal("24.99"), None, 55),
    ],
}


class Command(BaseCommand):
    help = "Seeds a handful of demo categories and products so the storefront isn't empty."

    def handle(self, *args, **options):
        created_categories = 0
        created_products = 0

        for category_name, products in CATALOG.items():
            category, was_created = Category.objects.get_or_create(name=category_name)
            created_categories += int(was_created)

            for index, (name, price, discount, stock) in enumerate(products):
                sku = f"{category.slug.upper()[:4]}-{index + 1:03d}"
                _, was_created = Product.objects.get_or_create(
                    sku=sku,
                    defaults={
                        "name": name,
                        "description": (
                            f"{name} — a top pick in {category_name}. "
                            "High-quality materials, reliable performance, and great value."
                        ),
                        "price": price,
                        "discount": discount,
                        "stock": stock,
                        "category": category,
                        "is_active": True,
                    },
                )
                created_products += int(was_created)

        self.stdout.write(
            self.style.SUCCESS(
                f"Seeded {created_categories} new categories and {created_products} new products "
                f"(existing ones were left untouched)."
            )
        )

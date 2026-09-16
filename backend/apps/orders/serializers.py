from decimal import Decimal

from django.db import transaction
from rest_framework import serializers

from apps.products.models import Product
from apps.users.models import Address
from apps.users.serializers import AddressSerializer

from .models import Order, OrderItem

FREE_SHIPPING_THRESHOLD = Decimal("100.00")
STANDARD_SHIPPING_FEE = Decimal("7.99")


def _build_image_url(image_field, request):
    if not image_field:
        return None
    url = image_field.url
    return request.build_absolute_uri(url) if request else url


class OrderItemProductSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "slug", "primary_image"]

    def get_primary_image(self, obj):
        images = list(obj.images.all())
        if not images:
            return None
        primary = next((image for image in images if image.is_primary), images[0])
        return _build_image_url(primary.image, self.context.get("request"))


class OrderItemSerializer(serializers.ModelSerializer):
    product = OrderItemProductSerializer(read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "quantity", "unit_price", "subtotal"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address = AddressSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "payment_method",
            "is_paid",
            "items",
            "shipping_address",
            "subtotal",
            "shipping_fee",
            "total",
            "created_at",
        ]


class OrderItemInputSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.filter(is_active=True))
    quantity = serializers.IntegerField(min_value=1)


class CreateOrderSerializer(serializers.Serializer):
    items = OrderItemInputSerializer(many=True)
    shipping_address_id = serializers.PrimaryKeyRelatedField(
        queryset=Address.objects.all(), source="shipping_address"
    )
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must contain at least one item.")
        return value

    def validate_shipping_address(self, address):
        request = self.context["request"]
        if address.user_id != request.user.id:
            raise serializers.ValidationError("Invalid shipping address.")
        return address

    def create(self, validated_data):
        request = self.context["request"]
        items_data = validated_data["items"]
        shipping_address = validated_data["shipping_address"]
        payment_method = validated_data["payment_method"]

        with transaction.atomic():
            subtotal = Decimal("0.00")
            locked_products = {}

            for item in items_data:
                product = Product.objects.select_for_update().get(pk=item["product"].pk)
                if product.stock < item["quantity"]:
                    raise serializers.ValidationError(
                        {"detail": f'Not enough stock for "{product.name}". Only {product.stock} left.'}
                    )
                locked_products[product.pk] = product
                subtotal += product.current_price * item["quantity"]

            shipping_fee = Decimal("0.00") if subtotal >= FREE_SHIPPING_THRESHOLD else STANDARD_SHIPPING_FEE
            total = subtotal + shipping_fee

            order = Order.objects.create(
                user=request.user,
                payment_method=payment_method,
                shipping_address=shipping_address,
                subtotal=subtotal,
                shipping_fee=shipping_fee,
                total=total,
            )

            for item in items_data:
                product = locked_products[item["product"].pk]
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item["quantity"],
                    unit_price=product.current_price,
                )
                product.stock -= item["quantity"]
                product.save(update_fields=["stock"])

        return order

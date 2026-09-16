from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Category, Product, ProductImage, Review

User = get_user_model()


def _build_image_url(image_field, request):
    if not image_field:
        return None
    url = image_field.url
    return request.build_absolute_uri(url) if request else url


class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "parent", "image", "subcategories"]

    def get_subcategories(self, obj):
        children = obj.subcategories.all()
        if not children:
            return []
        return CategorySerializer(children, many=True, context=self.context).data


class CategoryMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug"]


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image", "alt_text", "is_primary"]


class ProductListSerializer(serializers.ModelSerializer):
    category = CategoryMinimalSerializer(read_only=True)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "price",
            "discount",
            "current_price",
            "stock",
            "average_rating",
            "review_count",
            "is_active",
            "category",
            "primary_image",
        ]

    def get_average_rating(self, obj):
        value = getattr(obj, "avg_rating", None)
        return round(value, 1) if value else None

    def get_review_count(self, obj):
        return getattr(obj, "num_reviews", 0) or 0

    def get_primary_image(self, obj):
        images = list(obj.images.all())
        if not images:
            return None
        primary = next((image for image in images if image.is_primary), images[0])
        return _build_image_url(primary.image, self.context.get("request"))


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "sku",
            "price",
            "discount",
            "current_price",
            "stock",
            "category",
            "images",
            "average_rating",
            "review_count",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def get_average_rating(self, obj):
        value = getattr(obj, "avg_rating", None)
        return round(value, 1) if value else None

    def get_review_count(self, obj):
        return getattr(obj, "num_reviews", 0) or 0


class ReviewUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email"]


class ReviewSerializer(serializers.ModelSerializer):
    user = ReviewUserSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ["id", "product", "user", "rating", "comment", "created_at"]
        read_only_fields = ["id", "user", "created_at"]

    def validate(self, attrs):
        request = self.context["request"]
        product = attrs.get("product") or getattr(self.instance, "product", None)
        if self.instance is None and Review.objects.filter(product=product, user=request.user).exists():
            raise serializers.ValidationError(
                {"detail": "You have already reviewed this product."}
            )
        return attrs

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)

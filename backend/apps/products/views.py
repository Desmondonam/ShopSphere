from django.db.models import Avg, Count, Q
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Category, Product, Review
from .permissions import IsOwnerOrReadOnly
from .serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ReviewSerializer,
)

ORDERING_FIELDS = {"price", "-price", "created_at", "-created_at"}


def annotated_products(queryset):
    return queryset.annotate(
        avg_rating=Avg("reviews__rating"),
        num_reviews=Count("reviews", distinct=True),
    )


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CategorySerializer
    lookup_field = "slug"
    pagination_class = None
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Category.objects.all().order_by("name")
        if self.action == "list":
            queryset = queryset.filter(parent__isnull=True)
        return queryset


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    lookup_field = "slug"
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        queryset = annotated_products(
            Product.objects.filter(is_active=True).select_related("category").prefetch_related("images")
        )

        params = self.request.query_params

        search = params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search) | Q(sku__icontains=search)
            )

        category_slug = params.get("category")
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        min_price = params.get("min_price")
        if min_price:
            queryset = queryset.filter(price__gte=min_price)

        max_price = params.get("max_price")
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        ordering = params.get("ordering")
        if ordering == "-average_rating":
            queryset = queryset.order_by("-avg_rating", "-created_at")
        elif ordering in ORDERING_FIELDS:
            queryset = queryset.order_by(ordering)
        else:
            queryset = queryset.order_by("-created_at")

        return queryset

    @action(detail=True, methods=["get"])
    def related(self, request, slug=None):
        product = self.get_object()
        queryset = annotated_products(
            Product.objects.filter(is_active=True, category=product.category)
            .exclude(id=product.id)
            .select_related("category")
            .prefetch_related("images")
        ).order_by("-avg_rating", "-created_at")[:8]

        serializer = ProductListSerializer(queryset, many=True, context=self.get_serializer_context())
        return Response(serializer.data)


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        queryset = Review.objects.select_related("user", "product").order_by("-created_at")
        product_id = self.request.query_params.get("product")
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset

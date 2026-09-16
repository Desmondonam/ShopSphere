from django.contrib import admin

from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product", "quantity", "unit_price")
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "user", "status", "payment_method", "is_paid", "total", "created_at")
    list_filter = ("status", "payment_method", "is_paid")
    search_fields = ("order_number", "user__email")
    readonly_fields = ("order_number", "subtotal", "shipping_fee", "total", "created_at", "updated_at")
    inlines = [OrderItemInline]

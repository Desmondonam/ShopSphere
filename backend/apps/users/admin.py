from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import Address, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ("email", "username", "first_name", "last_name", "is_seller", "is_staff")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering = ("email",)
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Store profile", {"fields": ("phone_number", "is_seller")}),
    )


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("full_name", "user", "city", "country", "is_default")
    list_filter = ("country", "is_default")
    search_fields = ("full_name", "user__email", "city")

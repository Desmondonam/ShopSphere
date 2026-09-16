from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Only the review's author may update or delete it; everyone else gets read-only."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user_id == request.user.id

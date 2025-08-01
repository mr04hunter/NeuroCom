from rest_framework.generics import GenericAPIView
from user.models import User
from rest_framework.permissions import IsAuthenticated
from typing import cast
class AuthenticatedAPIView(GenericAPIView):
    """Base view that ensures user is authenticated and properly typed."""
    permission_classes = [IsAuthenticated]
    
    @property
    def authenticated_user(self) -> User:
        """Returns the authenticated user with proper typing."""
        return cast(User, self.request.user)
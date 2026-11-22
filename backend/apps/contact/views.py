from rest_framework import generics, permissions
from .models import ContactMessage
from .serializers import ContactMessageCreateSerializer


class ContactMessageCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageCreateSerializer
    permission_classes = [permissions.AllowAny]

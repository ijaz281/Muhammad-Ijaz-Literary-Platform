from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import NewsletterSubscriber
from .serializers import NewsletterSubscribeSerializer


class NewsletterSubscribeView(generics.CreateAPIView):
    serializer_class = NewsletterSubscribeSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        subscriber, created = NewsletterSubscriber.objects.get_or_create(
            email=email, defaults={"is_active": True}
        )
        if not created and not subscriber.is_active:
            subscriber.is_active = True
            subscriber.save(update_fields=["is_active"])
        return Response({
            "subscribed": True,
            "created": created,
            "message": "Thank you for subscribing."
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class NewsletterUnsubscribeView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = str(request.data.get("email", "")).strip().lower()
        if not email:
            return Response({"email": "This field is required."}, status=400)
        updated = NewsletterSubscriber.objects.filter(email=email, is_active=True).update(is_active=False)
        return Response({"unsubscribed": bool(updated)})

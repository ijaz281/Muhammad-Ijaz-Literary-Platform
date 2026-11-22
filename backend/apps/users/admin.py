from django.contrib import admin
from .models import Follow, OTPChallenge, UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "is_private", "updated_at")
    search_fields = ("user__username", "user__email", "bio")
    list_filter = ("is_private",)


@admin.register(Follow)
class FollowAdmin(admin.ModelAdmin):
    list_display = ("follower", "following", "created_at")
    search_fields = ("follower__username", "following__username")


@admin.register(OTPChallenge)
class OTPChallengeAdmin(admin.ModelAdmin):
    list_display = ("email", "purpose", "expires_at", "attempts", "created_at")
    search_fields = ("email",)
    exclude = ("otp_hash", "pending_data")
    readonly_fields = ("created_at", "last_sent_at", "expires_at", "attempts")

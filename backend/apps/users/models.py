from django.conf import settings
from django.db import models


class OTPChallenge(models.Model):
    SIGNUP = "signup"
    LOGIN = "login"
    PURPOSE_CHOICES = [(SIGNUP, "Signup"), (LOGIN, "Login")]

    purpose = models.CharField(max_length=10, choices=PURPOSE_CHOICES)
    email = models.EmailField(db_index=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.CASCADE, related_name="otp_challenges",
    )
    pending_data = models.JSONField(default=dict, blank=True)
    otp_hash = models.CharField(max_length=256)
    created_at = models.DateTimeField(auto_now_add=True)
    last_sent_at = models.DateTimeField()
    expires_at = models.DateTimeField(db_index=True)
    attempts = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["email", "purpose", "created_at"])]

    def __str__(self):
        return f"{self.purpose} OTP for {self.email}"


class UserProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="community_profile",
    )
    bio = models.CharField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to="profiles/avatars/", blank=True, null=True)
    is_private = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile: {self.user.username}"


class Follow(models.Model):
    follower = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="following_relationships",
    )
    following = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
        related_name="follower_relationships",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        models.CheckConstraint(
            check=~models.Q(follower=models.F("following")),
            name="prevent_self_follow",
        ),
        indexes = [models.Index(fields=["following", "created_at"]), models.Index(fields=["follower", "created_at"])]

    def __str__(self):
        return f"{self.follower} follows {self.following}"

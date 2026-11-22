from rest_framework.throttling import ScopedRateThrottle


class OTPRequestThrottle(ScopedRateThrottle):
    scope = "otp_request"


class OTPVerifyThrottle(ScopedRateThrottle):
    scope = "otp_verify"

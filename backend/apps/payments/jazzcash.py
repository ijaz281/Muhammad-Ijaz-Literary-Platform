"""JazzCash MWALLET hosted-payment helpers.

This implements the HTTP POST / hosted payment portal flow (MWALLET).
Merchant secrets are read only from Django settings and are never returned
by the JSON payment-initiation API.
"""
import hashlib
import hmac
from datetime import timedelta

from django.conf import settings
from django.utils import timezone


def _required_setting(name):
    value = getattr(settings, name, "")
    if not value:
        raise RuntimeError(f"{name} is not configured.")
    return value


def jazzcash_credentials():
    return {
        "merchant_id": _required_setting("JAZZCASH_MERCHANT_ID"),
        "password": _required_setting("JAZZCASH_PASSWORD"),
        "integrity_salt": _required_setting("JAZZCASH_INTEGRITY_SALT"),
        "payment_url": _required_setting("JAZZCASH_PAYMENT_URL"),
        "return_url": _required_setting("JAZZCASH_RETURN_URL"),
    }


def generate_secure_hash(fields, integrity_salt):
    """Create JazzCash HMAC-SHA256 over PP-prefixed fields.

    The secure-hash field itself is excluded. Field names are sorted using
    Python's ASCII-compatible Unicode ordering. The merchant guide's
    UTF-8 -> ISO-8859-1 conversion is applied before HMAC calculation.
    """
    values = [
        str(fields[name])
        for name in sorted(fields)
        if name.upper().startswith("PP") and name != "pp_SecureHash"
        and fields[name] is not None
    ]
    message = integrity_salt + "&" + "&".join(values)
    encoded = message.encode("utf-8").decode("utf-8").encode("iso-8859-1")
    digest = hmac.new(
        integrity_salt.encode("utf-8"),
        encoded,
        hashlib.sha256,
    ).hexdigest()
    return digest


def verify_secure_hash(fields, integrity_salt):
    supplied = str(fields.get("pp_SecureHash", "")).strip().lower()
    if not supplied:
        return False
    expected = generate_secure_hash(fields, integrity_salt).lower()
    return hmac.compare_digest(supplied, expected)


def build_mwallet_fields(payment):
    credentials = jazzcash_credentials()
    order = payment.order
    txn_time = timezone.localtime(payment.created_at)
    expiry_time = txn_time + timedelta(minutes=30)

    # JazzCash PKR amount is expressed in the smallest currency unit.
    amount = int(payment.amount * 100)
    fields = {
        "pp_Version": "1.1",
        "pp_TxnType": "MWALLET",
        "pp_Language": "EN",
        "pp_MerchantID": credentials["merchant_id"],
        "pp_SubMerchantID": "",
        "pp_Password": credentials["password"],
        "pp_BankID": "",
        "pp_ProductID": "",
        "pp_TxnRefNo": payment.gateway_reference,
        "pp_Amount": str(amount),
        "pp_TxnCurrency": payment.currency,
        "pp_TxnDateTime": txn_time.strftime("%Y%m%d%H%M%S"),
        "pp_BillReference": str(order.pk)[:20],
        "pp_Description": "Literary platform book order",
        "pp_TxnExpiryDateTime": expiry_time.strftime("%Y%m%d%H%M%S"),
        "pp_ReturnURL": credentials["return_url"],
    }
    fields["pp_SecureHash"] = generate_secure_hash(
        fields, credentials["integrity_salt"]
    )
    return credentials["payment_url"], fields

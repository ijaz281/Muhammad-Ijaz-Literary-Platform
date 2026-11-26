from django.test import SimpleTestCase

from .jazzcash import generate_secure_hash, verify_secure_hash


class JazzCashHashTests(SimpleTestCase):
    def test_hash_verifies_and_rejects_tampering(self):
        fields = {
            "pp_MerchantID": "MER123",
            "pp_OrderInfo": "A48cvE28",
            "pp_Amount": "2995",
        }
        salt = "0F5DD14AE2"
        fields["pp_SecureHash"] = generate_secure_hash(fields, salt)
        self.assertTrue(verify_secure_hash(fields, salt))
        fields["pp_Amount"] = "2996"
        self.assertFalse(verify_secure_hash(fields, salt))

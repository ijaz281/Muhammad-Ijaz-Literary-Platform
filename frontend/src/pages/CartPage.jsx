import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  LoaderCircle,
  LockKeyhole,
  CheckCircle2,
  CreditCard,
  Upload,
} from "lucide-react";

import Container from "../components/ui/Container";
import { isAuthenticated } from "../services/authService";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  checkout,
  createPayment,
  submitJazzCashProof,
} from "../services/cartService";

const initialAddress = {
  full_name: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "Pakistan",
  customer_notes: "",
};

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");

  const [address, setAddress] = useState(initialAddress);
  const [showCheckout, setShowCheckout] = useState(false);
  const [order, setOrder] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("jazzcash");
  const [payment, setPayment] = useState(null);
  const [paymentInitLoading, setPaymentInitLoading] = useState(false);

  const [transactionId, setTransactionId] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [proofLoading, setProofLoading] = useState(false);

  const authenticated = isAuthenticated();

  async function loadCart() {
    try {
      setLoading(true);
      setError("");

      const data = await getCart();
      setCart(data);
    } catch {
      setError("Unable to load your cart. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authenticated) {
      loadCart();
    } else {
      setLoading(false);
    }
  }, [authenticated]);

  async function handleQuantity(item, quantity) {
    if (quantity < 1) return;

    try {
      setUpdating(item.id);
      setError("");

      const updatedCart = await updateCartItem(item.id, quantity);
      setCart(updatedCart);
    } catch (err) {
      const data = err.response?.data;
      const firstError =
        data && typeof data === "object"
          ? Object.values(data).flat()[0]
          : null;

      setError(String(firstError || "Unable to update item quantity."));
    } finally {
      setUpdating(null);
    }
  }

  async function handleRemove(itemId) {
    try {
      setUpdating(itemId);
      setError("");

      await removeCartItem(itemId);
      await loadCart();
    } catch {
      setError("Unable to remove this item.");
    } finally {
      setUpdating(null);
    }
  }

  function handleAddressChange(event) {
    setAddress((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function extractError(err, fallback) {
    const data = err.response?.data;

    if (data && typeof data === "object") {
      const firstError = Object.values(data).flat()[0];
      return String(firstError || fallback);
    }

    return fallback;
  }

  async function handleCheckout(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const result = await checkout({
        ...address,
        payment_method: paymentMethod,
      });

      // The order has been created successfully.
      setOrder(result);
      setCart(null);
      setShowCheckout(false);
      setAddress(initialAddress);

      // COD does not require a separate payment initialization.
      if (paymentMethod === "cod") {
        setPayment(null);
        return;
      }

      // Retrieve the pending JazzCash payment created during checkout.
      try {
        setPaymentInitLoading(true);

        const paymentResult = await createPayment(result.order_number);

        setPayment(paymentResult.payment || paymentResult);
      } catch (paymentError) {
        setError(
          extractError(
            paymentError,
            "Your order was created, but payment information could not be loaded. Please try again."
          )
        );
      } finally {
        setPaymentInitLoading(false);
      }
    } catch (err) {
      setError(
        extractError(
          err,
          "Checkout could not be completed. Please try again."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleRetryPayment() {
    if (!order?.order_number) return;

    try {
      setPaymentInitLoading(true);
      setError("");

      const result = await createPayment(order.order_number);
      setPayment(result.payment || result);
    } catch (err) {
      setError(
        extractError(err, "Unable to load payment information.")
      );
    } finally {
      setPaymentInitLoading(false);
    }
  }

  async function handleProofSubmit(event) {
    event.preventDefault();

    if (!payment?.id) {
      setError("Payment information is unavailable. Please reload it.");
      return;
    }

    if (!transactionId.trim()) {
      setError("Please enter your JazzCash transaction ID.");
      return;
    }

    if (!receipt) {
      setError("Please select your JazzCash payment receipt.");
      return;
    }

    try {
      setProofLoading(true);
      setError("");

      const result = await submitJazzCashProof(
        payment.id,
        transactionId.trim(),
        receipt
      );

      setPayment(result.payment || result);
      setTransactionId("");
      setReceipt(null);

      setError("");
    } catch (err) {
      setError(
        extractError(
          err,
          "Unable to submit your payment receipt. Please try again."
        )
      );
    } finally {
      setProofLoading(false);
    }
  }

  const items = cart?.items || [];
  const subtotal = Number(cart?.subtotal || 0);

  function formatPrice(value) {
    return `PKR ${Number(value || 0).toLocaleString("en-PK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function renderOrderSuccess() {
    const verificationStatus = payment?.verification_status;

    return (
      <div className="mx-auto mt-14 max-w-2xl border border-gray-200 bg-white p-7 sm:p-10">
        <div className="text-center">
          <CheckCircle2
            className="mx-auto text-green-600"
            size={52}
          />

          <h2 className="mt-5 font-serif text-3xl font-bold text-literary-navy">
            Order Placed Successfully
          </h2>

          <p className="mt-4 text-gray-600">
            Thank you for ordering from our bookstore.
          </p>

          <div className="mt-6 space-y-3 bg-gray-50 p-5 text-left text-sm">
            <p className="break-all">
              <strong>Order Number:</strong> {order.order_number}
            </p>

            <p>
              <strong>Total Amount:</strong>{" "}
              {formatPrice(order.total_amount)}
            </p>

            <p>
              <strong>Payment Method:</strong>{" "}
              {order.payment_method === "cod"
                ? "Cash on Delivery"
                : "JazzCash"}
            </p>

            <p>
              <strong>Order Status:</strong>{" "}
              {order.status || "Pending"}
            </p>
          </div>
        </div>

        {order.payment_method === "cod" ? (
          <div className="mt-7 border border-green-200 bg-green-50 p-5">
            <h3 className="font-semibold text-green-800">
              Cash on Delivery Selected
            </h3>

            <p className="mt-2 text-sm leading-6 text-green-700">
              Your order has been submitted. You can pay the delivery
              person when your books arrive.
            </p>
          </div>
        ) : (
          <div className="mt-7 border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-3">
              <CreditCard className="text-amber-800" size={24} />

              <h3 className="font-serif text-xl font-bold text-literary-navy">
                JazzCash Payment
              </h3>
            </div>

            {paymentInitLoading ? (
              <div className="mt-5 flex items-center gap-3 text-sm text-gray-600">
                <LoaderCircle
                  className="animate-spin"
                  size={20}
                />
                Loading payment information...
              </div>
            ) : !payment ? (
              <div className="mt-5">
                <p className="text-sm leading-6 text-gray-700">
                  Your order has been created, but payment information
                  is not currently available.
                </p>

                <button
                  type="button"
                  onClick={handleRetryPayment}
                  disabled={paymentInitLoading}
                  className="mt-4 bg-literary-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                >
                  Retry Loading Payment
                </button>
              </div>
            ) : (
              <>
                <div className="mt-5 space-y-3 text-sm text-gray-700">
                  <p>
                    <strong>Amount to Pay:</strong>{" "}
                    {formatPrice(payment.amount)}
                  </p>

                  <p className="break-all">
                    <strong>Payment Reference:</strong>{" "}
                    {payment.payment_reference}
                  </p>
                </div>

                {verificationStatus === "approved" ? (
                  <div className="mt-6 border border-green-200 bg-green-50 p-5">
                    <h4 className="font-bold text-green-800">
                      Payment Verified
                    </h4>

                    <p className="mt-2 text-sm text-green-700">
                      Your JazzCash payment has been approved.
                    </p>
                  </div>
                ) : verificationStatus === "submitted" ? (
                  <div className="mt-6 border border-blue-200 bg-blue-50 p-5">
                    <h4 className="font-bold text-blue-800">
                      Receipt Submitted Successfully
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-blue-700">
                      Your payment receipt has been submitted and is
                      waiting for administrator verification.
                    </p>
                  </div>
                ) : (
                  <>
                    {verificationStatus === "rejected" && (
                      <div className="mt-6 border border-red-200 bg-red-50 p-5">
                        <h4 className="font-bold text-red-800">
                          Previous Receipt Rejected
                        </h4>

                        <p className="mt-2 text-sm text-red-700">
                          {payment.review_note ||
                            "Your previous payment proof was rejected. Please check your transaction details and submit valid proof again."}
                        </p>
                      </div>
                    )}

                    <div className="mt-6">
                      <h4 className="font-semibold text-literary-navy">
                        How to Complete Your Payment
                      </h4>

                      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-gray-700">
                        <li>
                          Open your JazzCash application or use the
                          official JazzCash payment method provided by
                          the bookstore.
                        </li>
                        <li>
                          Pay the exact amount shown above using the
                          bookstore's verified receiving account
                          details.
                        </li>
                        <li>
                          Save your successful transaction receipt.
                        </li>
                        <li>
                          Enter your transaction ID and upload the
                          receipt below.
                        </li>
                      </ol>
                    </div>

                    <form
                      onSubmit={handleProofSubmit}
                      className="mt-7 space-y-5 border-t border-amber-200 pt-6"
                    >
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          JazzCash Transaction ID
                        </label>

                        <input
                          type="text"
                          value={transactionId}
                          onChange={(event) =>
                            setTransactionId(event.target.value)
                          }
                          required
                          maxLength={255}
                          placeholder="Enter transaction ID"
                          className="w-full border border-gray-300 bg-white px-4 py-3 outline-none focus:border-literary-gold"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Upload Payment Receipt
                        </label>

                        <input
                          type="file"
                          accept="image/*,.pdf"
                          required
                          onChange={(event) =>
                            setReceipt(event.target.files?.[0] || null)
                          }
                          className="w-full text-sm text-gray-600"
                        />

                        {receipt && (
                          <p className="mt-2 text-xs text-gray-500">
                            Selected: {receipt.name}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={proofLoading}
                        className="flex w-full items-center justify-center gap-2 bg-literary-navy px-6 py-4 font-semibold text-white transition hover:bg-literary-gold hover:text-literary-navy disabled:opacity-60"
                      >
                        {proofLoading ? (
                          <LoaderCircle
                            className="animate-spin"
                            size={19}
                          />
                        ) : (
                          <Upload size={19} />
                        )}

                        {proofLoading
                          ? "Submitting Receipt..."
                          : "Submit Payment Receipt"}
                      </button>
                    </form>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {error && (
          <p className="mt-5 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/account"
            className="bg-literary-navy px-8 py-4 text-center font-semibold text-white hover:bg-literary-gold hover:text-literary-navy"
          >
            My Account
          </Link>

          <Link
            to="/books"
            className="border border-literary-navy px-8 py-4 text-center font-semibold text-literary-navy hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7f3] py-16 sm:py-24">
      <Container>
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-literary-gold">
            Your Selection
          </p>

          <h1 className="mt-4 font-serif text-4xl font-bold text-literary-navy sm:text-6xl">
            Shopping Cart
          </h1>
        </div>

        {!authenticated ? (
          <div className="mx-auto mt-14 max-w-xl border border-gray-200 bg-white p-10 text-center">
            <LockKeyhole
              className="mx-auto text-literary-gold"
              size={42}
            />

            <h2 className="mt-5 font-serif text-2xl font-bold text-literary-navy">
              Login Required
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              Please log in to access your personal shopping cart.
            </p>

            <Link
              to="/account"
              className="mt-7 inline-block bg-literary-navy px-8 py-4 font-semibold text-white hover:bg-literary-gold hover:text-literary-navy"
            >
              Login to Continue
            </Link>
          </div>
        ) : loading && !order ? (
          <div className="flex justify-center py-24">
            <LoaderCircle
              className="animate-spin text-literary-gold"
              size={38}
            />
          </div>
        ) : order ? (
          renderOrderSuccess()
        ) : (
          <div className="mx-auto mt-14 max-w-6xl">
            {error && (
              <p className="mb-6 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </p>
            )}

            {items.length === 0 ? (
              <div className="border border-gray-200 bg-white px-6 py-16 text-center">
                <ShoppingBag
                  className="mx-auto text-literary-gold"
                  size={48}
                />

                <h2 className="mt-5 font-serif text-2xl font-bold text-literary-navy">
                  Your Cart is Empty
                </h2>

                <p className="mt-3 text-gray-600">
                  Explore the bookstore and discover your next read.
                </p>

                <Link
                  to="/books"
                  className="mt-7 inline-block bg-literary-navy px-8 py-4 font-semibold text-white hover:bg-literary-gold hover:text-literary-navy"
                >
                  Explore Books
                </Link>
              </div>
            ) : (
              <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
                <section className="space-y-4">
                  {items.map((item) => (
                    <article
                      key={item.id}
                      className="flex flex-col gap-5 border border-gray-200 bg-white p-5 sm:flex-row sm:items-center"
                    >
                      <div className="h-32 w-24 shrink-0 overflow-hidden bg-gray-100">
                        {item.cover_image ? (
                          <img
                            src={item.cover_image}
                            alt={item.book_title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-gray-400">
                            <ShoppingBag size={28} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h2 className="font-serif text-xl font-bold text-literary-navy">
                          {item.book_title}
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                          {formatPrice(item.unit_price)} per copy
                        </p>

                        <p className="mt-3 font-semibold text-literary-navy">
                          {formatPrice(item.line_total)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end">
                        <div className="flex items-center border border-gray-300">
                          <button
                            type="button"
                            disabled={
                              updating === item.id || item.quantity <= 1
                            }
                            onClick={() =>
                              handleQuantity(item, item.quantity - 1)
                            }
                            className="p-2 hover:bg-gray-100 disabled:opacity-40"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="min-w-10 text-center text-sm font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            disabled={updating === item.id}
                            onClick={() =>
                              handleQuantity(item, item.quantity + 1)
                            }
                            className="p-2 hover:bg-gray-100 disabled:opacity-40"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          type="button"
                          disabled={updating === item.id}
                          onClick={() => handleRemove(item.id)}
                          className="flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-800 disabled:opacity-40"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    </article>
                  ))}
                </section>

                <aside className="border border-gray-200 bg-white p-7">
                  <h2 className="font-serif text-2xl font-bold text-literary-navy">
                    Order Summary
                  </h2>

                  <div className="mt-7 flex justify-between border-b border-gray-200 pb-5 text-sm">
                    <span className="text-gray-600">
                      Items ({cart?.total_items || 0})
                    </span>

                    <span className="font-semibold">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="mt-5 flex justify-between">
                    <span className="font-bold text-literary-navy">
                      Subtotal
                    </span>

                    <span className="font-bold text-literary-navy">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <p className="mt-4 text-xs leading-6 text-gray-500">
                    Shipping charges, if applicable, will be calculated
                    during order processing.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowCheckout(!showCheckout)}
                    className="mt-8 w-full bg-literary-navy px-5 py-4 font-semibold text-white transition hover:bg-literary-gold hover:text-literary-navy"
                  >
                    {showCheckout ? "Hide Checkout" : "Proceed to Checkout"}
                  </button>
                </aside>
              </div>
            )}

            {showCheckout && items.length > 0 && (
              <section className="mt-10 border border-gray-200 bg-white p-7 sm:p-10">
                <h2 className="font-serif text-2xl font-bold text-literary-navy">
                  Shipping Information
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Enter the address where you want your books delivered.
                </p>

                <form
                  onSubmit={handleCheckout}
                  className="mt-8 grid gap-5 sm:grid-cols-2"
                >
                  {[
                    ["full_name", "Full Name", true],
                    ["phone", "Phone Number", true],
                    ["address_line_1", "Address Line 1", true],
                    ["address_line_2", "Address Line 2", false],
                    ["city", "City", true],
                    ["state", "State / Province", false],
                    ["postal_code", "Postal Code", false],
                    ["country", "Country", true],
                  ].map(([name, label, required]) => (
                    <div
                      key={name}
                      className={
                        name.startsWith("address_line")
                          ? "sm:col-span-2"
                          : ""
                      }
                    >
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        {label}
                      </label>

                      <input
                        name={name}
                        value={address[name]}
                        onChange={handleAddressChange}
                        required={required}
                        className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-literary-gold"
                      />
                    </div>
                  ))}

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Order Notes (Optional)
                    </label>

                    <textarea
                      name="customer_notes"
                      value={address.customer_notes}
                      onChange={handleAddressChange}
                      rows={3}
                      className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-literary-gold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <h3 className="mb-4 font-serif text-xl font-bold text-literary-navy">
                      Select Payment Method
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <label
                        className={`flex cursor-pointer items-start gap-3 border p-5 ${
                          paymentMethod === "jazzcash"
                            ? "border-literary-gold bg-amber-50"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value="jazzcash"
                          checked={paymentMethod === "jazzcash"}
                          onChange={() => setPaymentMethod("jazzcash")}
                          className="mt-1"
                        />

                        <span>
                          <span className="flex items-center gap-2 font-semibold text-literary-navy">
                            <CreditCard size={19} />
                            JazzCash
                          </span>

                          <span className="mt-2 block text-sm leading-5 text-gray-500">
                            Pay through JazzCash and submit your
                            transaction receipt for verification.
                          </span>
                        </span>
                      </label>

                      <label
                        className={`flex cursor-pointer items-start gap-3 border p-5 ${
                          paymentMethod === "cod"
                            ? "border-literary-gold bg-amber-50"
                            : "border-gray-200"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                          className="mt-1"
                        />

                        <span>
                          <span className="font-semibold text-literary-navy">
                            Cash on Delivery
                          </span>

                          <span className="mt-2 block text-sm leading-5 text-gray-500">
                            Pay when your books are delivered.
                          </span>
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-3 bg-literary-navy px-7 py-4 font-semibold text-white hover:bg-literary-gold hover:text-literary-navy disabled:opacity-60 sm:w-auto"
                    >
                      {loading && (
                        <LoaderCircle
                          className="animate-spin"
                          size={18}
                        />
                      )}

                      {loading ? "Processing..." : "Place Order"}
                    </button>
                  </div>
                </form>
              </section>
            )}
          </div>
        )}
      </Container>
    </main>
  );
}
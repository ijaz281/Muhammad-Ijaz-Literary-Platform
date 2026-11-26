import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  LoaderCircle,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";

import Container from "../components/ui/Container";
import { isAuthenticated } from "../services/authService";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  checkout,
  createJazzCashPayment,
  getOrder,
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
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [searchParams] = useSearchParams();
  const paymentReturnOrder = searchParams.get("order");

  const authenticated = isAuthenticated();

  async function loadCart() {
    try {
      setLoading(true);
      setError("");

      const data = await getCart();
      setCart(data);
    } catch {
      setError("خریداری کی ٹوکری لوڈ نہیں ہو سکی۔ دوبارہ کوشش کریں۔");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authenticated) {
      loadCart();
      if (paymentReturnOrder) {
        getOrder(paymentReturnOrder)
          .then(setOrder)
          .catch(() => setError("ادائیگی کا نتیجہ حاصل نہیں ہو سکا۔ اپنے آرڈرز میں اسٹیٹس چیک کریں۔"));
      }
    } else {
      setLoading(false);
    }
  }, [authenticated, paymentReturnOrder]);

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

      setError(String(firstError || "اشیا کی تعداد اپ ڈیٹ نہیں ہو سکی۔"));
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
      setError("یہ شے حذف نہیں ہو سکی۔");
    } finally {
      setUpdating(null);
    }
  }

  function handleAddressChange(event) {
    setAddress({
      ...address,
      [event.target.name]: event.target.value,
    });
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

      if (paymentMethod === "jazzcash") {
        setOrder(result);
        setCart(null);
        setShowCheckout(false);
        const payment = await createJazzCashPayment(result.order_number);
        window.location.assign(payment.redirect_url);
        return;
      }

      setOrder(result);
      setCart(null);
      setShowCheckout(false);
      setAddress(initialAddress);
    } catch (err) {
      const data = err.response?.data;

      if (data && typeof data === "object") {
        const firstError = Object.values(data).flat()[0];
        setError(String(firstError || "چیک آؤٹ مکمل نہیں ہو سکا۔"));
      } else {
        setError("چیک آؤٹ مکمل نہیں ہو سکا۔ براہِ کرم دوبارہ کوشش کریں۔");
      }
    } finally {
      setLoading(false);
    }
  }

  async function continueJazzCashPayment() {
    if (!order?.order_number) return;
    try {
      setLoading(true);
      setError("");
      const payment = await createJazzCashPayment(order.order_number);
      window.location.assign(payment.redirect_url);
    } catch (err) {
      const data = err.response?.data;
      const firstError = data && typeof data === "object"
        ? Object.values(data).flat()[0]
        : null;
      setError(String(firstError || "JazzCash ادائیگی شروع نہیں ہو سکی۔"));
    } finally {
      setLoading(false);
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

  return (
    <main className="min-h-screen bg-[#f8f7f3] py-16 sm:py-24">
      <Container>
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-literary-gold">
            آپ کا انتخاب
          </p>

          <h1 className="mt-4 font-serif text-4xl font-bold text-literary-navy sm:text-6xl">
            خریداری کی ٹوکری
          </h1>
        </div>

        {!authenticated ? (
          <div className="mx-auto mt-14 max-w-xl border border-gray-200 bg-white p-10 text-center">
            <LockKeyhole
              className="mx-auto text-literary-gold"
              size={42}
            />

            <h2 className="mt-5 font-serif text-2xl font-bold text-literary-navy">
              لاگ اِن ضروری ہے
            </h2>

            <p className="mt-3 leading-7 text-gray-600">
              اپنی ذاتی خریداری کی ٹوکری تک رسائی کے لیے لاگ اِن کریں۔
            </p>

            <Link
              to="/account"
              className="mt-7 inline-block bg-literary-navy px-8 py-4 font-semibold text-white hover:bg-literary-gold hover:text-literary-navy"
            >
              جاری رکھنے کے لیے لاگ اِن کریں
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
          <div className="mx-auto mt-14 max-w-xl border border-gray-200 bg-white p-10 text-center">
            {error && <p className="mb-5 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <CheckCircle2
              className="mx-auto text-green-600"
              size={52}
            />

            <h2 className="mt-5 font-serif text-3xl font-bold text-literary-navy">
              {order.payment_status === "paid"
                ? "ادائیگی کامیاب ہو گئی"
                : order.payment_status === "failed"
                  ? "ادائیگی مکمل نہیں ہو سکی"
                  : order.payment_method === "jazzcash"
                    ? "ادائیگی کی تصدیق جاری ہے"
                    : "آرڈر مکمل ہو گیا"}
            </h2>

            <p className="mt-4 text-gray-600">
              {order.payment_status === "paid"
                ? "JazzCash نے آپ کی ادائیگی کی تصدیق کر دی ہے۔"
                : order.payment_status === "failed"
                  ? "ادائیگی ناکام ہوئی۔ آپ آرڈر کی تفصیلات میں اسٹیٹس دیکھ سکتے ہیں۔"
                  : order.payment_method === "jazzcash"
                    ? "آپ کی ادائیگی ابھی زیرِ تصدیق ہے۔ براہِ کرم دوبارہ ادائیگی شروع نہ کریں۔"
                    : "آپ کا آرڈر کامیابی سے جمع ہو گیا ہے۔"}
            </p>

            <p className="mt-5 break-all bg-gray-50 p-4 text-sm">
              آرڈر نمبر: {order.order_number}
            </p>

            <p className="mt-4 font-bold text-literary-navy">
              کل رقم: {formatPrice(order.total_amount)}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              ادائیگی کی حالت: {order.payment_status || "pending"}
            </p>

            {order.payment_method === "jazzcash" && order.payment_status !== "paid" && (
              <button
                type="button"
                onClick={continueJazzCashPayment}
                disabled={loading}
                className="mt-7 mr-3 inline-block bg-literary-gold px-8 py-4 font-semibold text-literary-navy disabled:opacity-60"
              >
                {loading ? "براہِ کرم انتظار کریں" : "JazzCash پر دوبارہ جائیں"}
              </button>
            )}
            <Link
              to="/account"
              className="mt-7 inline-block bg-literary-navy px-8 py-4 font-semibold text-white hover:bg-literary-gold hover:text-literary-navy"
            >
              میرا اکاؤنٹ
            </Link>
          </div>
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
                  آپ کی ٹوکری خالی ہے
                </h2>

                <p className="mt-3 text-gray-600">
                  کتب خانے کی سیر کریں اور اپنی اگلی پسندیدہ کتاب دریافت کریں۔
                </p>

                <Link
                  to="/books"
                  className="mt-7 inline-block bg-literary-navy px-8 py-4 font-semibold text-white hover:bg-literary-gold hover:text-literary-navy"
                >
                  کتب دیکھیے
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
                            disabled={updating === item.id || item.quantity <= 1}
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
                          حذف کریں
                        </button>
                      </div>
                    </article>
                  ))}
                </section>

                <aside className="border border-gray-200 bg-white p-7">
                  <h2 className="font-serif text-2xl font-bold text-literary-navy">
                    آرڈر کا خلاصہ
                  </h2>

                  <div className="mt-7 flex justify-between border-b border-gray-200 pb-5 text-sm">
                    <span className="text-gray-600">
                      اشیا ({cart?.total_items || 0})
                    </span>

                    <span className="font-semibold">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <div className="mt-5 flex justify-between">
                    <span className="font-bold text-literary-navy">
                      ذیلی مجموعہ
                    </span>

                    <span className="font-bold text-literary-navy">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  <p className="mt-4 text-xs leading-6 text-gray-500">
                    اگر ترسیلی اخراجات لاگو ہوئے تو آرڈر کی کارروائی کے دوران ان کا حساب کیا جائے گا۔
                  </p>

                  <button
                    onClick={() => setShowCheckout(!showCheckout)}
                    className="mt-8 w-full bg-literary-navy px-5 py-4 font-semibold text-white transition hover:bg-literary-gold hover:text-literary-navy"
                  >
                    {showCheckout ? "چیک آؤٹ بند کریں" : "چیک آؤٹ کی طرف بڑھیں"}
                  </button>
                </aside>
              </div>
            )}

            {showCheckout && items.length > 0 && (
              <section className="mt-10 border border-gray-200 bg-white p-7 sm:p-10">
                <h2 className="font-serif text-2xl font-bold text-literary-navy">
                  ترسیل کی معلومات
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  وہ پتہ درج کریں جہاں آپ اپنی کتب وصول کرنا چاہتے ہیں۔
                </p>

                <form
                  onSubmit={handleCheckout}
                  className="mt-8 grid gap-5 sm:grid-cols-2"
                >
                  {[
                    ["full_name", "مکمل نام", true],
                    ["phone", "فون نمبر", true],
                    ["address_line_1", "پتہ، پہلی سطر", true],
                    ["address_line_2", "پتہ، دوسری سطر", false],
                    ["city", "شہر", true],
                    ["state", "صوبہ", false],
                    ["postal_code", "پوسٹل کوڈ", false],
                    ["country", "ملک", true],
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
                    <p className="mb-3 text-sm font-semibold text-gray-700">
                      ادائیگی کا طریقہ منتخب کریں
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className={`flex cursor-pointer items-center gap-3 border p-4 ${paymentMethod === "jazzcash" ? "border-literary-gold bg-amber-50" : "border-gray-300"}`}>
                        <input
                          type="radio"
                          name="payment_method"
                          value="jazzcash"
                          checked={paymentMethod === "jazzcash"}
                          onChange={() => setPaymentMethod("jazzcash")}
                        />
                        <span>
                          <span className="block font-semibold text-literary-navy">JazzCash Mobile Account</span>
                          <span className="mt-1 block text-xs text-gray-500">ادائیگی JazzCash کے محفوظ پیج پر مکمل کریں</span>
                        </span>
                      </label>
                      <label className={`flex cursor-pointer items-center gap-3 border p-4 ${paymentMethod === "cod" ? "border-literary-gold bg-amber-50" : "border-gray-300"}`}>
                        <input
                          type="radio"
                          name="payment_method"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={() => setPaymentMethod("cod")}
                        />
                        <span>
                          <span className="block font-semibold text-literary-navy">Cash on Delivery</span>
                          <span className="mt-1 block text-xs text-gray-500">کتابیں وصول کرتے وقت ادائیگی کریں</span>
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      آرڈر سے متعلق نوٹ (اختیاری)
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

                      {paymentMethod === "jazzcash" ? "JazzCash کے ذریعے ادائیگی کریں" : "آرڈر مکمل کریں"}
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
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
} from "lucide-react";

import Container from "../components/ui/Container";
import { isAuthenticated } from "../services/authService";
import {
  getCart,
  updateCartItem,
  removeCartItem,
  checkout,
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

      const result = await checkout(address);

      setOrder(result);
      setCart(null);
      setShowCheckout(false);
      setAddress(initialAddress);
    } catch (err) {
      const data = err.response?.data;

      if (data && typeof data === "object") {
        const firstError = Object.values(data).flat()[0];
        setError(String(firstError || "Checkout could not be completed."));
      } else {
        setError("Checkout could not be completed. Please try again.");
      }
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
          <div className="mx-auto mt-14 max-w-xl border border-gray-200 bg-white p-10 text-center">
            <CheckCircle2
              className="mx-auto text-green-600"
              size={52}
            />

            <h2 className="mt-5 font-serif text-3xl font-bold text-literary-navy">
              Order Placed
            </h2>

            <p className="mt-4 text-gray-600">
              Your order has been submitted successfully.
            </p>

            <p className="mt-5 break-all bg-gray-50 p-4 text-sm">
              Order Number: {order.order_number}
            </p>

            <p className="mt-4 font-bold text-literary-navy">
              Total: {formatPrice(order.total_amount)}
            </p>

            <Link
              to="/account"
              className="mt-7 inline-block bg-literary-navy px-8 py-4 font-semibold text-white hover:bg-literary-gold hover:text-literary-navy"
            >
              My Account
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

                      Place Order
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
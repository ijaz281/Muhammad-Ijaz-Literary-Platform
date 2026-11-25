
import { useState } from "react";

import {
  Mail,
  MapPin,
  Send,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import Container from "../components/ui/Container";
import { sendContactMessage } from "../services/contactService";


const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};


export default function ContactPage() {
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await sendContactMessage({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      setSuccess(
        "آپ کا پیغام موصول ہو گیا، رابطہ کرنے کا شکریہ۔ ہم جلد آپ سے رابطہ کریں گے۔"
      );

      setForm(initialForm);

    } catch (err) {
      const data = err.response?.data;

      let errorMessage =
        "آپ کا پیغام نہیں بھیجا جا سکا۔ براہِ کرم کچھ دیر بعد دوبارہ کوشش کریں۔";

      if (typeof data?.detail === "string") {
        errorMessage = data.detail;
      } else if (typeof data?.message === "string") {
        errorMessage = data.message;
      } else if (data && typeof data === "object") {
        const firstError = Object.values(data).flat()[0];

        if (typeof firstError === "string") {
          errorMessage = firstError;
        }
      }

      setError(errorMessage);

    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7f3] py-16 sm:py-24">
      <Container>

        {/* Page Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <p className="text-sm font-bold uppercase tracking-[0.3em] text-literary-gold">
            رابطے میں رہیے
          </p>

          <h1 className="mt-4 font-serif text-4xl font-bold text-literary-navy sm:text-6xl">
            رابطہ
          </h1>

          <p className="mx-auto mt-6 max-w-2xl leading-8 text-gray-600">
            کوئی سوال، تجویز یا ادبی استفسار ہے؟
            ہمیں پیغام بھیجیے اور رابطہ قائم کیجیے۔
          </p>

        </div>


        {/* Contact Section */}

        <div className="mx-auto mt-14 grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">

          {/* Contact Information */}

          <div className="bg-literary-navy p-8 text-white sm:p-10">

            <h2 className="font-serif text-2xl font-bold">
              آئیے رابطہ قائم کریں
            </h2>

            <p className="mt-5 leading-8 text-gray-300">
              آپ کی آرا اور تجاویز ہمارے لیے قیمتی ہیں۔
              بلا جھجھک ہم سے رابطہ کیجیے۔
            </p>

            <div className="mt-10 space-y-7">

              <div className="flex gap-4">

                <Mail className="mt-1 shrink-0 text-literary-gold" />

                <div>
                  <p className="font-semibold">
                    ای میل
                  </p>

                  <p className="mt-1 break-all text-sm text-gray-300">
                    رابطہ فارم کے ذریعے اپنا پیغام بھیجیے۔
                  </p>
                </div>

              </div>


              <div className="flex gap-4">

                <MapPin className="mt-1 shrink-0 text-literary-gold" />

                <div>
                  <p className="font-semibold">
                    ادبی پلیٹ فارم
                  </p>

                  <p className="mt-1 text-sm text-gray-300">
                    محمد اعجاز الحق
                  </p>
                </div>

              </div>

            </div>

          </div>


          {/* Contact Form */}

          <form
            onSubmit={handleSubmit}
            className="border border-gray-200 bg-white p-7 shadow-sm sm:p-10"
          >

            {/* Success Message */}

            {success && (
              <div
                role="status"
                aria-live="polite"
                className="mb-6 flex gap-3 bg-green-50 p-4 text-sm text-green-700"
              >
                <CheckCircle2
                  size={20}
                  className="shrink-0"
                />

                <p>{success}</p>
              </div>
            )}


            {/* Error Message */}

            {error && (
              <div
                role="alert"
                className="mb-6 flex gap-3 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle
                  size={20}
                  className="shrink-0"
                />

                <p>{error}</p>
              </div>
            )}


            {/* Name and Email */}

            <div className="grid gap-5 sm:grid-cols-2">

              <div>

                <label
                  htmlFor="contact-name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  آپ کا نام
                </label>

                <input
                  id="contact-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  autoComplete="name"
                  disabled={loading}
                  className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-literary-gold disabled:bg-gray-100"
                  placeholder="اپنا نام درج کریں"
                />

              </div>


              <div>

                <label
                  htmlFor="contact-email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  ای میل ایڈریس
                </label>

                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                  disabled={loading}
                  className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-literary-gold disabled:bg-gray-100"
                  placeholder="مثلاً: name@example.com"
                />

              </div>

            </div>


            {/* Subject */}

            <div className="mt-5">

              <label
                htmlFor="contact-subject"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                موضوع
              </label>

              <input
                id="contact-subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                maxLength={255}
                disabled={loading}
                className="w-full border border-gray-300 px-4 py-3 outline-none focus:border-literary-gold disabled:bg-gray-100"
                placeholder="پیغام کا موضوع"
              />

            </div>


            {/* Message */}

            <div className="mt-5">

              <label
                htmlFor="contact-message"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                آپ کا پیغام
              </label>

              <textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                minLength={10}
                rows={6}
                disabled={loading}
                className="w-full resize-y border border-gray-300 px-4 py-3 outline-none focus:border-literary-gold disabled:bg-gray-100"
                placeholder="اپنا پیغام تحریر کریں..."
              />

            </div>


            {/* Submit Button */}

            <button
              type="submit"
              disabled={loading}
              className="mt-7 inline-flex items-center gap-3 bg-literary-navy px-8 py-4 font-semibold text-white transition hover:bg-literary-gold hover:text-literary-navy disabled:cursor-not-allowed disabled:opacity-60"
            >

              {loading ? (
                <LoaderCircle
                  className="animate-spin"
                  size={18}
                />
              ) : (
                <Send size={18} />
              )}

              {loading ? "بھیجا جا رہا ہے..." : "پیغام بھیجیں"}

            </button>

          </form>

        </div>

      </Container>
    </main>
  );
}

import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";

import Container from "../components/ui/Container";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-[70vh] items-center bg-[#f8f7f3] py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-serif text-8xl font-bold text-literary-gold sm:text-9xl">
            404
          </p>

          <h1 className="mt-5 font-serif text-3xl font-bold text-literary-navy sm:text-4xl">
            صفحہ دستیاب نہیں
          </h1>

          <p className="mx-auto mt-5 max-w-lg leading-8 text-gray-600">
            ممکن ہے آپ کا مطلوبہ صفحہ منتقل کر دیا گیا ہو، حذف ہو گیا ہو یا عارضی طور پر دستیاب نہ ہو۔
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-literary-navy px-7 py-4 font-semibold text-white hover:bg-literary-gold hover:text-literary-navy"
            >
              <ArrowLeft size={18} />
              صفحۂ اوّل پر واپس جائیں
            </Link>

            <Link
              to="/books"
              className="inline-flex items-center gap-2 border border-literary-navy px-7 py-4 font-semibold text-literary-navy hover:bg-literary-navy hover:text-white"
            >
              <BookOpen size={18} />
              کتب دیکھیے
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
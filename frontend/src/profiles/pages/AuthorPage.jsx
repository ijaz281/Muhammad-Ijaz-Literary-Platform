
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Globe,
  Mail,
  MapPin,
  Feather,
  LoaderCircle,
  BookOpen,
  Quote,
  Sparkles,
} from "lucide-react";
import Container from "../../components/ui/Container";
import SectionHeading from "../../components/ui/SectionHeading";
import { getAuthors } from "../services/authorsService";

/* -----------------------------------------
   SOCIAL LINK
----------------------------------------- */

function SocialLink({ href, label, children }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center border border-literary-gold/40 text-literary-gold transition-all duration-300 hover:-translate-y-1 hover:bg-literary-gold hover:text-literary-navy"
    >
      {children}
    </a>
  );
}

/* -----------------------------------------
   LITERARY ANIMATION
----------------------------------------- */

function LiteraryBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="literary-glow literary-glow-one" />
      <div className="literary-glow literary-glow-two" />

      <div className="literary-orbit literary-orbit-one" />
      <div className="literary-orbit literary-orbit-two" />

      <div className="literary-floating literary-book-one">
        <BookOpen size={65} strokeWidth={0.8} />
      </div>

      <div className="literary-floating literary-book-two">
        <Feather size={48} strokeWidth={0.8} />
      </div>

      <div className="literary-floating literary-quote">
        <Quote size={45} strokeWidth={0.8} />
      </div>

      <div className="literary-particles">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={index}
            style={{
              "--particle-index": index,
              left: `${(index * 17 + 8) % 100}%`,
              animationDelay: `${(index % 6) * -1.4}s`,
              animationDuration: `${7 + (index % 5) * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="literary-lines" />
    </div>
  );
}

/* -----------------------------------------
   LARGE AUTHOR PORTRAIT
----------------------------------------- */

function AuthorPortrait({ author }) {
  const [imageError, setImageError] = useState(false);

  // Existing authorsService.js normalizes these fields.
  const portraitUrl = author.profileImage || author.coverImage;

  useEffect(() => {
    setImageError(false);
  }, [portraitUrl]);

  return (
    <div className="author-portrait-wrap relative mx-auto w-full max-w-[500px]">

      {/* Outer golden frame */}
      <div className="absolute -right-3 -top-3 h-full w-full border border-literary-gold/70" />

      {/* Decorative corner */}
      <div className="absolute -bottom-5 -left-5 z-20 h-24 w-24 border-b-4 border-l-4 border-literary-gold" />

      {/* Main image */}
      <div className="author-portrait relative z-10 aspect-[4/5] w-full overflow-hidden bg-[#14233b] shadow-2xl">

        {portraitUrl && !imageError ? (
          <img
            src={portraitUrl}
            alt={`Portrait of ${author.fullName || "مصنف"}`}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover object-top"
            loading="eager"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <Feather
              size={90}
              strokeWidth={0.8}
              className="text-literary-gold"
            />

            <h3 className="mt-8 font-serif text-3xl font-bold text-white">
              {author.fullName}
            </h3>

            <p className="mt-3 text-sm tracking-widest text-literary-gold">
              مصنف کی تصویر
            </p>
          </div>
        )}

        {/* Image overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071323]/75 via-transparent to-transparent" />

        <div className="absolute bottom-6 left-6 right-6">
          <p className="text-xs uppercase tracking-[0.3em] text-literary-gold">
            ادبی ذخیرہ
          </p>

          <p className="mt-2 font-serif text-2xl font-bold text-white">
            {author.fullName}
          </p>
        </div>
      </div>

      {/* Decorative badge */}
      <div className="absolute -bottom-8 -right-2 z-20 flex h-20 w-20 items-center justify-center rounded-full border border-literary-gold bg-literary-navy shadow-xl sm:-right-8">
        <Feather
          size={32}
          strokeWidth={1}
          className="text-literary-gold"
        />
      </div>
    </div>
  );
}

/* -----------------------------------------
   AUTHOR SHOWCASE
----------------------------------------- */

function AuthorCard({ author }) {
  return (
    <article className="author-showcase relative overflow-hidden bg-[#09172a] text-white shadow-2xl">

      <LiteraryBackground />

      <div className="relative z-10 grid items-center gap-14 px-7 py-16 sm:px-12 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(350px,500px)] lg:gap-20 lg:px-20 lg:py-24">

        {/* LEFT: AUTHOR INFORMATION */}

        <div className="author-text order-2 lg:order-1">

          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-literary-gold" />

            <p className="text-xs font-bold uppercase tracking-[0.35em] text-literary-gold">
              نمایاں مصنف
            </p>
          </div>

          <h2 className="mt-8 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {author.fullName}
          </h2>

          {author.penName && (
            <p className="mt-4 font-serif text-xl italic text-literary-gold sm:text-2xl">
              {author.penName}
            </p>
          )}

          {author.headline && (
            <div className="mt-8 border-l-2 border-literary-gold pl-5">
              <p className="text-base font-medium leading-8 text-gray-200 sm:text-lg">
                {author.headline}
              </p>
            </div>
          )}

          {author.location && (
            <p className="mt-7 flex items-center gap-3 text-sm text-gray-300">
              <MapPin
                size={18}
                className="shrink-0 text-literary-gold"
              />
              {author.location}
            </p>
          )}

          <div className="mt-9 max-w-2xl whitespace-pre-line text-sm leading-8 text-gray-300 sm:text-base">
            {author.biography || "تعارف جلد اپ ڈیٹ کیا جائے گا۔"}
          </div>

          {/* Literary quotation decoration */}
          <div className="mt-9 flex items-start gap-4 border-t border-white/10 pt-7">
            <Quote
              size={30}
              className="shrink-0 text-literary-gold"
            />

            <p className="font-serif text-lg italic leading-8 text-gray-300">
              ہر کتاب ایک سفر ہے اور ہر لفظ اپنا نشان چھوڑتا ہے۔
            </p>
          </div>

          {/* Social links */}
          <div className="mt-9 flex flex-wrap items-center gap-3">

            <SocialLink href={author.website} label="ویب سائٹ">
              <Globe size={19} />
            </SocialLink>

            <SocialLink href={author.facebook} label="فیس بک">
              <span className="font-bold">f</span>
            </SocialLink>

            <SocialLink href={author.instagram} label="انسٹاگرام">
            IG
            </SocialLink>

            <SocialLink href={author.youtube} label="یوٹیوب">
            YT
            </SocialLink>

            {author.email && (
              <a
                href={`mailto:${author.email}`}
                className="inline-flex items-center gap-2 bg-literary-gold px-5 py-3 text-sm font-bold text-literary-navy transition duration-300 hover:-translate-y-1 hover:bg-white"
              >
                <Mail size={17} />
                مصنف سے رابطہ کریں
              </a>
            )}
          </div>

          <div className="mt-10 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-literary-gold/70">
            <Sparkles size={16} />
            الفاظ • ادب • ورثہ
          </div>
        </div>

        {/* RIGHT: LARGE PORTRAIT */}

        <div className="author-image order-1 px-3 py-3 lg:order-2">
          <AuthorPortrait author={author} />
        </div>

      </div>
    </article>
  );
}

/* -----------------------------------------
   MAIN AUTHOR PAGE
----------------------------------------- */

export default function AuthorPage({ mode = "authors" }) {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAbout = mode === "about";

  useEffect(() => {
    let active = true;

    async function loadAuthors() {
      try {
        setLoading(true);
        setError("");

        const data = await getAuthors();

        if (active) {
          setAuthors(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Author page error:", err);

        if (active) {
          setError("مصنفین کے تعارف لوڈ نہیں ہو سکے۔ دوبارہ کوشش کریں۔");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAuthors();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="author-page min-h-screen bg-literary-cream">

      {/* ANIMATED PAGE HERO */}

      <section className="author-hero relative overflow-hidden bg-[#071323] py-24 text-white sm:py-32">

        <LiteraryBackground />

        <Container>
          <div className="relative z-10 mx-auto max-w-4xl text-center">

            <div className="mb-7 flex items-center justify-center gap-3">
              <Feather className="text-literary-gold" size={22} />

              <p className="text-xs font-bold uppercase tracking-[0.4em] text-literary-gold">
                محمد اعجاز الحق کا ادبی پلیٹ فارم
              </p>

              <Feather className="text-literary-gold" size={22} />
            </div>

            <h1 className="font-serif text-5xl font-bold leading-tight sm:text-6xl lg:text-7xl">
              {isAbout ? "ادب کی ایک دنیا" : "الفاظ کے پسِ پردہ آوازیں"}
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-sm leading-8 text-gray-300 sm:text-lg">
              {isAbout
                ? "ادب، تخلیق، علم اور بامعنی خیالات کے لیے ایک مختص پلیٹ فارم۔"
                : "ادیبوں کی کہانیاں، ان کی شناخت اور ان کے ادبی سفر کو تشکیل دینے والے خیالات جانیے۔"}
            </p>

            <div className="mx-auto mt-10 flex items-center justify-center gap-4">
              <span className="h-px w-16 bg-literary-gold/60" />
              <BookOpen className="text-literary-gold" size={25} />
              <span className="h-px w-16 bg-literary-gold/60" />
            </div>

          </div>
        </Container>
      </section>

      {/* ABOUT PLATFORM */}

      {isAbout && (
        <section className="bg-white py-16 sm:py-24">
          <Container>
            <div className="mx-auto max-w-4xl">

              <SectionHeading
                eyebrow="ہمارا مقصد"
                title="ادب کے گرد قائم ایک پلیٹ فارم"
                description="کتب، تحریروں، مصنفین اور قارئین کو ایک ادبی مرکز پر یکجا کرنا۔"
                align="left"
              />

              <div className="mt-10 space-y-6 text-base leading-8 text-literary-muted">

                <p>
                  محمد اعجاز الحق کا ادبی پلیٹ فارم ادبی تخلیقات پیش کرنے اور قارئین کو کتب، شاعری، مضامین، کہانیوں اور دیگر تحریروں تک آسان رسائی فراہم کرنے کے لیے بنایا گیا ہے۔
                </p>

                <p>
                  اس پلیٹ فارم کا مقصد مطالعے کو فروغ دینا، ادبی اظہار کی حوصلہ افزائی کرنا اور شائع شدہ تخلیقات کو آسانی سے دریافت کرنے کا موقع فراہم کرنا ہے۔
                </p>

                <p>
                  کتب خانے اور ادبی ذخیرے کے ذریعے قارئین تحریر کی مختلف اصناف کا مطالعہ کر سکتے ہیں اور ان کے تخلیق کاروں کے بارے میں جان سکتے ہیں۔
                </p>

              </div>

              <div className="mt-10 flex flex-wrap gap-4">

                <Link
                  to="/books"
                  className="inline-flex items-center gap-2 bg-literary-navy px-6 py-3 text-sm font-bold text-white transition hover:bg-literary-gold hover:text-literary-navy"
                >
                  کتب دیکھیے <ArrowRight size={17} />
                </Link>

                <Link
                  to="/literature"
                  className="inline-flex items-center gap-2 border border-literary-navy px-6 py-3 text-sm font-bold text-literary-navy transition hover:bg-literary-navy hover:text-white"
                >
                  ادب پڑھیے <ArrowRight size={17} />
                </Link>

              </div>
            </div>
          </Container>
        </section>
      )}

      {/* AUTHOR COLLECTION */}

      <section className="relative overflow-hidden bg-[#f5f1e8] py-20 sm:py-28">

        <Container>

          <SectionHeading
            eyebrow={isAbout ? "پلیٹ فارم سے وابستہ شخصیات" : "مصنفین کی فہرست"}
            title={isAbout ? "ہمارے مصنف سے ملیے" : "ہمارے ممتاز مصنفین"}
            description="ادبی شناخت، ذاتی سفر اور تخلیقی خدمات دریافت کیجیے۔"
          />

          {loading && (
            <div className="flex justify-center py-24">
              <LoaderCircle
                size={42}
                className="animate-spin text-literary-gold"
              />
            </div>
          )}

          {!loading && error && (
            <div className="mx-auto mt-12 max-w-2xl border border-red-200 bg-red-50 p-8 text-center">
              <p className="text-sm text-red-700">{error}</p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 font-bold text-literary-navy underline"
              >
                صفحہ دوبارہ لوڈ کریں
              </button>
            </div>
          )}

          {!loading && !error && authors.length === 0 && (
            <div className="mt-12 border border-gray-200 bg-white p-12 text-center">

              <Feather
                size={48}
                className="mx-auto text-literary-gold"
              />

              <h2 className="mt-5 font-serif text-2xl font-bold text-literary-navy">
                مصنف کا تعارف جلد پیش کیا جائے گا
              </h2>

              <p className="mt-3 text-sm leading-7 text-literary-muted">
                انتظامی پینل کے ذریعے مصنف کا فعال پروفائل شامل ہوتے ہی اس کی معلومات یہاں دکھائی دیں گی۔
              </p>

            </div>
          )}

          {!loading && !error && authors.length > 0 && (
            <div className="mt-16 space-y-20">
              {authors.map((author) => (
                <AuthorCard key={author.id} author={author} />
              ))}
            </div>
          )}

        </Container>
      </section>

      {/* CLOSING SECTION */}

      <section className="relative overflow-hidden bg-[#071323] py-16 text-center text-white">

        <LiteraryBackground />

        <Container>
          <div className="relative z-10">

            <Feather
              size={38}
              className="mx-auto text-literary-gold"
            />

            <h2 className="mt-6 font-serif text-3xl font-bold sm:text-4xl">
              ادب کی دنیا دریافت کیجیے
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-gray-300">
              بامعنی الفاظ، قابلِ ذکر کتب اور خیالات کو زندگی دینے والے لکھاریوں کو جانیے۔
            </p>

            <Link
              to="/literature"
              className="mt-8 inline-flex items-center gap-3 bg-literary-gold px-8 py-4 font-bold text-literary-navy transition duration-300 hover:-translate-y-1 hover:bg-white"
            >
              ادب دریافت کیجیے
              <ArrowRight size={18} />
            </Link>

          </div>
        </Container>
      </section>

      {/* ANIMATION STYLES */}

      <style>{`
        .author-page .literary-glow {
          position: absolute;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.16;
          background: #c6a15b;
          animation: literaryGlow 12s ease-in-out infinite alternate;
        }

        .author-page .literary-glow-one {
          top: -180px;
          left: -100px;
        }

        .author-page .literary-glow-two {
          bottom: -200px;
          right: -100px;
          animation-delay: -6s;
        }

        .author-page .literary-orbit {
          position: absolute;
          width: 420px;
          height: 420px;
          border: 1px solid rgba(198,161,91,0.10);
          border-radius: 50%;
          animation: literaryRotate 45s linear infinite;
        }

        .author-page .literary-orbit-one {
          top: -250px;
          right: 8%;
        }

        .author-page .literary-orbit-two {
          bottom: -300px;
          left: 10%;
          width: 520px;
          height: 520px;
          animation-direction: reverse;
        }

        .author-page .literary-floating {
          position: absolute;
          color: #c6a15b;
          opacity: 0.12;
          animation: literaryFloat 8s ease-in-out infinite;
        }

        .author-page .literary-book-one {
          top: 18%;
          right: 12%;
          animation-delay: -2s;
        }

        .author-page .literary-book-two {
          bottom: 15%;
          left: 8%;
          animation-delay: -4s;
        }

        .author-page .literary-quote {
          top: 55%;
          right: 38%;
          opacity: 0.06;
          animation-delay: -1s;
        }

        .author-page .literary-particles span {
          position: absolute;
          bottom: -20px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #d7b66d;
          box-shadow: 0 0 12px rgba(215,182,109,0.8);
          animation: literaryParticle linear infinite;
        }

        .author-page .literary-lines {
          position: absolute;
          inset: 0;
          opacity: 0.12;
          background-image: repeating-linear-gradient(
            115deg,
            transparent,
            transparent 80px,
            rgba(255,255,255,0.035) 81px,
            transparent 82px
          );
        }

        .author-page .author-showcase {
          border: 1px solid rgba(198,161,91,0.3);
        }

        .author-page .author-text {
          animation: authorTextReveal 1s ease both;
        }

        .author-page .author-image {
          animation: authorImageReveal 1.2s ease both;
        }

        .author-page .author-portrait {
          border: 1px solid rgba(198,161,91,0.55);
        }

        .author-page .author-portrait img {
          transition: transform 1s ease;
        }

        .author-page .author-portrait:hover img {
          transform: scale(1.045);
        }

        @keyframes literaryFloat {
          0%, 100% {
            transform: translateY(0) rotate(-5deg);
          }
          50% {
            transform: translateY(-28px) rotate(5deg);
          }
        }

        @keyframes literaryGlow {
          from {
            transform: scale(0.85);
            opacity: 0.10;
          }
          to {
            transform: scale(1.2);
            opacity: 0.24;
          }
        }

        @keyframes literaryRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes literaryParticle {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          15% {
            opacity: 0.8;
          }
          85% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-110vh);
            opacity: 0;
          }
        }

        @keyframes authorTextReveal {
          from {
            opacity: 0;
            transform: translateX(-35px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes authorImageReveal {
          from {
            opacity: 0;
            transform: translateX(35px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @media (max-width: 1023px) {
          .author-page .literary-book-one {
            right: 3%;
          }

          .author-page .literary-quote {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .author-page *,
          .author-page *::before,
          .author-page *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

    </main>
  );
}

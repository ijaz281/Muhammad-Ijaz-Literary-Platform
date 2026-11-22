
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Feather,
  Library,
  PenTool,
  BookMarked,
  Sparkles,
  LoaderCircle,
  RefreshCw,
  Globe2,
  Quote,
  ScrollText,
  Star,
} from "lucide-react";

import Container from "../components/ui/Container";
import SectionHeading from "../components/ui/SectionHeading";

import { getFeaturedBooks } from "../services/booksService";
import { getAllPublications } from "../literature/services/literatureService";
import { getPrimaryAuthor } from "../profiles/services/authorsService";

const reveal = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: "easeOut" },
  },
};

const literaryCategories = [
  {
    icon: BookOpen,
    number: "01",
    title: "Books & Publications",
    description:
      "Explore published books and discover meaningful literary works.",
    link: "/books",
    label: "Explore the library",
  },
  {
    icon: Feather,
    number: "02",
    title: "Literary Writing",
    description:
      "Discover essays, articles, poetry and creative expression.",
    link: "/literature",
    label: "Read literature",
  },
  {
    icon: Library,
    number: "03",
    title: "Literary Collection",
    description:
      "Browse an organized collection of knowledge and ideas.",
    link: "/literature",
    label: "Discover collections",
  },
];

function SectionLabel({ children }) {
  return (
    <div className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-literary-gold">
      <span className="h-px w-8 bg-literary-gold" />
      {children}
    </div>
  );
}

function Reveal({ children, className = "", delay = 0 }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? undefined : reveal}
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView={shouldReduceMotion ? undefined : "visible"}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------
   HERO SECTION
------------------------------------------------------- */

function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-literary-dark text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_45%,#D6B46B,transparent_35%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_35%,#FFFFFF_100%)]" />
      </div>

      <div className="pointer-events-none absolute -right-40 -top-40 h-[550px] w-[550px] rounded-full border border-literary-gold/15" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full border border-literary-gold/15" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-literary-emerald opacity-20 blur-[100px]" />

      <Container>
        <div className="relative grid min-h-[690px] items-center gap-10 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="relative z-10 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8 inline-flex items-center gap-3 rounded-full border border-literary-gold/30 bg-white/[0.04] px-5 py-3"
            >
              <Sparkles size={15} className="text-literary-gold" />
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-literary-gold sm:text-xs">
                A World of Words and Ideas
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.12 }}
              className="font-serif text-5xl font-bold leading-[1.12] tracking-tight sm:text-6xl lg:text-[76px]"
            >
              Discover the Art of
              <span className="mt-3 block bg-gradient-to-r from-literary-gold-light via-literary-gold to-literary-gold-dark bg-clip-text text-transparent">
                Literature.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="mt-8 max-w-xl text-base leading-8 text-white/65 sm:text-lg"
            >
              Welcome to the literary world of Muhammad Ijaz Ul Haq.
              Explore books, discover meaningful ideas and experience
              the timeless beauty of written expression.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                to="/books"
                className="group inline-flex items-center gap-3 rounded-sm bg-literary-gold px-7 py-4 text-sm font-bold text-literary-dark shadow-gold transition duration-300 hover:-translate-y-1 hover:bg-literary-gold-light"
              >
                Explore Books
                <ArrowUpRight
                  size={18}
                  className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>

              <Link
                to="/literature"
                className="group inline-flex items-center gap-3 rounded-sm border border-white/25 px-7 py-4 text-sm font-semibold text-white transition duration-300 hover:border-literary-gold hover:text-literary-gold"
              >
                <BookOpen size={18} />
                Discover Literature
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="mt-16 flex items-center gap-5 border-t border-white/10 pt-8"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-literary-gold/40 bg-literary-gold/10 text-literary-gold">
                <BookMarked size={22} />
              </div>
              <div>
                <p className="font-serif text-lg text-white">
                  Knowledge Through Words
                </p>
                <p className="mt-1 text-xs tracking-[0.18em] text-white/40">
                  READ. EXPLORE. DISCOVER.
                </p>
              </div>
            </motion.div>
          </div>

          {/* CSS 3D BOOK */}
          <div className="relative flex min-h-[440px] items-center justify-center lg:min-h-[570px]">
            <motion.div
              animate={shouldReduceMotion ? undefined : { y: [0, -10, 0], rotate: [-0.6, 0.6, -0.6] }}
              transition={{
                duration: 8,
                repeat: shouldReduceMotion ? 0 : Infinity,
                ease: "easeInOut",
              }}
              className="hero-book-float relative z-10"
              style={{ perspective: "1200px" }}
            >
              <div
                className="relative h-[370px] w-[255px] sm:h-[430px] sm:w-[300px]"
                style={{
                  transform: "rotateY(-18deg) rotateX(5deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Book pages */}
                <div className="absolute inset-y-2 right-[-18px] w-7 rounded-r-sm bg-gradient-to-r from-[#B5A88A] via-[#F5EBD4] to-[#9F9275] shadow-xl" />

                {/* Book cover */}
                <div
                  className="absolute inset-0 overflow-hidden rounded-sm border border-literary-gold/60 bg-gradient-to-br from-[#28634E] via-[#174638] to-[#0B211B] shadow-[25px_30px_45px_rgba(0,0,0,0.55)]"
                  style={{ transform: "translateZ(12px)" }}
                >
                  <div className="absolute inset-4 border border-literary-gold/50" />
                  <div className="absolute inset-6 border border-literary-gold/20" />

                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(214,180,107,0.18),transparent_50%)]" />

                  <div className="relative flex h-full flex-col items-center justify-center px-7 text-center">
                    <div className="mb-9 flex h-14 w-14 items-center justify-center rounded-full border border-literary-gold/50 text-literary-gold">
                      <Feather size={29} strokeWidth={1} />
                    </div>

                    <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-literary-gold">
                      The Art of Words
                    </p>

                    <h2 className="mt-6 font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
                      A World
                      <span className="block text-literary-gold">
                        of Literature
                      </span>
                    </h2>

                    <div className="my-7 h-px w-16 bg-literary-gold/70" />

                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/60">
                      Muhammad Ijaz Ul Haq
                    </p>

                    <div className="mt-12 text-literary-gold/70">
                      <BookOpen size={24} strokeWidth={1} />
                    </div>
                  </div>
                </div>

                {/* Spine */}
                <div
                  className="absolute inset-y-0 left-[-12px] w-5 origin-right rounded-l-sm border-r border-literary-gold/40 bg-gradient-to-b from-[#0B211B] via-[#28634E] to-[#0B211B]"
                  style={{ transform: "rotateY(-90deg) translateZ(12px)" }}
                />
              </div>
            </motion.div>

            {/* Decorative orbit */}
            <motion.div
              animate={shouldReduceMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 48, repeat: shouldReduceMotion ? 0 : Infinity, ease: "linear" }}
              className="hero-orbit pointer-events-none absolute h-[430px] w-[430px] rounded-full border border-dashed border-literary-gold/20 sm:h-[520px] sm:w-[520px]"
            />

            <div className="pointer-events-none absolute h-[300px] w-[300px] rounded-full bg-literary-gold/10 blur-[80px]" />

            <motion.div
              animate={shouldReduceMotion ? undefined : { y: [0, -7, 0] }}
              transition={{ duration: 6, repeat: shouldReduceMotion ? 0 : Infinity }}
              className="absolute right-0 top-12 hidden rounded-sm border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md sm:block"
            >
              <Quote size={22} className="text-literary-gold" />
              <p className="mt-2 text-xs text-white/70">
                Words create worlds.
              </p>
            </motion.div>

            <motion.div
              animate={shouldReduceMotion ? undefined : { y: [0, 7, 0] }}
              transition={{ duration: 7, repeat: shouldReduceMotion ? 0 : Infinity }}
              className="absolute bottom-12 left-0 hidden rounded-sm border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md sm:block"
            >
              <Star size={20} className="text-literary-gold" />
              <p className="mt-2 text-xs text-white/70">
                Inspired by literature.
              </p>
            </motion.div>
          </div>
        </div>
      </Container>

      <div className="relative h-1 bg-gradient-to-r from-transparent via-literary-gold to-transparent opacity-70" />
    </section>
  );
}

/* -------------------------------------------------------
   INTRODUCTION
------------------------------------------------------- */

function IntroductionSection() {
  return (
    <section className="relative overflow-hidden bg-literary-cream py-24 sm:py-28">
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-literary-gold/10 blur-[100px]" />

      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <Reveal className="relative">
            <div className="relative rounded-sm border border-literary-gold/40 bg-[#EDE6D7] p-5 shadow-premium sm:p-8">
              <div className="relative flex min-h-[350px] flex-col items-center justify-center overflow-hidden border border-literary-gold/30 bg-gradient-to-br from-literary-emerald to-literary-dark px-7 py-12 text-center">
                <div className="absolute inset-5 border border-literary-gold/20" />

                <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-literary-gold/40 bg-literary-gold/10 text-literary-gold">
                  <Feather size={42} strokeWidth={1} />
                </div>

                <p className="relative mt-8 font-serif text-3xl font-bold text-white sm:text-4xl">
                  The Power of Words
                </p>

                <p className="relative mt-5 max-w-sm text-sm leading-8 text-white/65">
                  Every book opens a door to knowledge, imagination
                  and new perspectives.
                </p>

                <div className="relative mt-8 h-px w-20 bg-literary-gold" />
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 -z-0 h-full w-full border border-literary-gold/30" />
          </Reveal>

          <Reveal delay={0.12}>
            <SectionLabel>About the Platform</SectionLabel>

            <h2 className="font-serif text-4xl font-bold leading-tight text-literary-navy sm:text-5xl lg:text-6xl">
              A Space for
              <span className="mt-2 block text-literary-gold">
                Literary Excellence.
              </span>
            </h2>

            <p className="mt-8 text-base leading-8 text-literary-muted">
              The Muhammad Ijaz Ul Haq Literary Platform brings books,
              publications and literary resources together in one place.
            </p>

            <p className="mt-5 text-base leading-8 text-literary-muted">
              Its purpose is to make literary works easier to explore,
              encourage reading and create a meaningful connection
              between authors and readers.
            </p>

            <div className="mt-8 flex items-center gap-4 border-l-2 border-literary-gold py-2 pl-5">
              <BookMarked size={25} className="shrink-0 text-literary-gold" />
              <p className="font-serif text-lg italic text-literary-navy">
                A journey of knowledge begins with a single page.
              </p>
            </div>

            <Link
              to="/about"
              className="group mt-10 inline-flex items-center gap-3 text-sm font-bold text-literary-emerald transition hover:text-literary-gold"
            >
              Discover More
              <ArrowRight size={18} className="transition group-hover:translate-x-2" />
            </Link>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------
   FEATURED BOOKS
------------------------------------------------------- */

function FeaturedBooksSection() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadBooks() {
    try {
      setLoading(true);
      setError("");

      const data = await getFeaturedBooks();
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Featured books error:", err);
      setError("Unable to load books. Please check your backend connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-28">
      <div className="pointer-events-none absolute right-0 top-0 h-80 w-80 rounded-full bg-literary-emerald/5 blur-[100px]" />

      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Explore Our Collection"
            title="Featured Books"
            description="Discover literary works from our growing collection."
          />
        </Reveal>

        {loading && (
          <div className="flex justify-center py-20">
            <LoaderCircle
              size={35}
              className="animate-spin text-literary-gold"
            />
          </div>
        )}

        {!loading && error && (
          <div className="mt-12 border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={loadBooks}
              className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-literary-navy"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && books.length === 0 && (
          <div className="mt-12 border border-literary-gold/20 bg-literary-cream p-12 text-center">
            <BookOpen size={40} className="mx-auto text-literary-gold" />
            <h3 className="mt-5 font-serif text-2xl font-bold text-literary-navy">
              Books Coming Soon
            </h3>
            <p className="mt-3 text-sm text-literary-muted">
              Our literary collection will appear here when books are available.
            </p>
          </div>
        )}

        {!loading && !error && books.length > 0 && (
          <div className="mt-14 grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {books.map((book, index) => (
              <Reveal key={book.id} delay={index * 0.08}>
                <article className="home-featured-book book-card-3d group h-full overflow-hidden rounded-sm border border-literary-gold/15 bg-white transition duration-500 hover:border-literary-gold/60 hover:shadow-premium">
                  <Link to={`/books/${book.slug || book.id}`} className="block">
                    <div className="book-card-stage relative flex h-64 items-center justify-center overflow-hidden bg-literary-cream">
                      <div className="absolute inset-0 bg-gradient-to-br from-literary-gold/5 to-literary-emerald/10" />

                      {book.cover ? (
                        <img
                          src={book.cover}
                          alt={book.title}
                          loading="lazy"
                          className="relative h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="relative flex h-[82%] w-[62%] flex-col items-center justify-center border border-literary-gold/50 bg-gradient-to-br from-literary-emerald to-literary-dark p-5 text-center shadow-xl transition duration-500 group-hover:-rotate-2">
                          <BookOpen size={38} className="text-literary-gold" />
                          <p className="mt-5 font-serif text-lg font-bold text-white">
                            {book.title}
                          </p>
                          <div className="mt-4 h-px w-10 bg-literary-gold" />
                        </div>
                      )}

                      <div className="absolute left-4 top-4 rounded-full border border-white/50 bg-literary-dark/80 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-literary-gold backdrop-blur">
                        Featured
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-literary-gold">
                        {book.category || "Literature"}
                      </p>

                      <h3 className="mt-3 font-serif text-xl font-bold text-literary-navy transition group-hover:text-literary-emerald">
                        {book.title}
                      </h3>

                      <p className="mt-2 text-sm text-literary-muted">
                        By {book.author || "Author"}
                      </p>

                      <p className="mt-4 line-clamp-3 text-sm leading-7 text-literary-muted">
                        {book.description || "Discover this literary work."}
                      </p>

                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-literary-emerald">
                        View Book
                        <ArrowRight
                          size={16}
                          className="transition group-hover:translate-x-2"
                        />
                      </span>
                    </div>
                  </Link>
                </article>
              </Reveal>
            ))}
          </div>
        )}

        <div className="mt-14 text-center">
          <Link
            to="/books"
            className="inline-flex items-center gap-3 border border-literary-emerald px-8 py-4 text-sm font-bold text-literary-emerald transition duration-300 hover:bg-literary-emerald hover:text-white"
          >
            View All Books
            <ArrowRight size={18} />
          </Link>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------
   LITERATURE HIGHLIGHTS
------------------------------------------------------- */

function LiteraryHighlightsSection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getAllPublications({ page_size: 3 })
      .then((result) => {
        if (active) {
          setItems(
            Array.isArray(result?.publications)
              ? result.publications.slice(0, 3)
              : []
          );
        }
      })
      .catch((err) => {
        console.error("Literary highlights error:", err);
        if (active) {
          setError("Literary publications are currently unavailable.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-literary-cream py-24 sm:py-28">
      <div className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-literary-gold/10 blur-[110px]" />

      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Words That Matter"
            title="Literary Highlights"
            description="Explore selected poetry, articles, stories and other literary publications."
          />
        </Reveal>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoaderCircle
              className="animate-spin text-literary-gold"
              size={32}
            />
          </div>
        ) : error ? (
          <p className="py-12 text-center text-sm text-literary-muted">
            {error}
          </p>
        ) : items.length === 0 ? (
          <div className="mt-12 border border-literary-gold/20 bg-white p-10 text-center">
            <Feather size={36} className="mx-auto text-literary-gold" />
            <h3 className="mt-4 font-serif text-2xl font-bold text-literary-navy">
              New Publications Coming Soon
            </h3>
            <p className="mt-3 text-sm text-literary-muted">
              Published literary works will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {items.map((item, index) => {
              const isUrdu = item.language === "ur";

              return (
                <Reveal key={item.id} delay={index * 0.1}>
                  <article className="group flex h-full flex-col overflow-hidden border border-literary-gold/20 bg-white transition duration-500 hover:-translate-y-2 hover:border-literary-gold/60 hover:shadow-premium">
                    <div className="relative h-52 overflow-hidden bg-literary-dark">
                      {item.cover ? (
                        <img
                          src={item.cover}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-literary-emerald to-literary-dark">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-literary-gold/40 text-literary-gold">
                            <ScrollText size={38} strokeWidth={1} />
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-literary-dark/60 to-transparent" />

                      <span className="absolute bottom-4 left-5 text-[10px] font-bold uppercase tracking-[0.2em] text-literary-gold">
                        {item.category?.replaceAll("_", " ") || "Literature"}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-7">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-literary-emerald">
                          {isUrdu ? "Urdu Publication" : "English Publication"}
                        </span>

                        <Globe2 size={15} className="text-literary-gold" />
                      </div>

                      <h3
                        dir={isUrdu ? "rtl" : "ltr"}
                        className={`mt-5 text-2xl font-bold leading-relaxed text-literary-navy ${
                          isUrdu
                            ? "urdu-content text-right"
                            : "font-serif"
                        }`}
                      >
                        {item.title}
                      </h3>

                      <p
                        dir={isUrdu ? "rtl" : "ltr"}
                        className={`mt-4 flex-1 text-sm leading-8 text-literary-muted ${
                          isUrdu ? "urdu-content text-right" : ""
                        }`}
                      >
                        {item.excerpt || "Explore this literary publication."}
                      </p>

                      <Link
                        to={`/literature/${item.slug || item.id}`}
                        className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-literary-emerald transition hover:text-literary-gold"
                      >
                        Read Publication
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}

        <div className="mt-14 text-center">
          <Link
            to="/literature"
            className="inline-flex items-center gap-3 border border-literary-emerald px-8 py-4 text-sm font-bold text-literary-emerald transition hover:bg-literary-emerald hover:text-white"
          >
            Explore All Literature
            <ArrowRight size={18} />
          </Link>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------
   CATEGORIES
------------------------------------------------------- */

function LiteraryCategoriesSection() {
  return (
    <section className="relative overflow-hidden bg-white py-24 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Explore the Platform"
            title="Discover a World of Literature"
            description="Find books, literary publications and resources to explore."
          />
        </Reveal>

        <div className="mt-14 grid gap-7 md:grid-cols-3">
          {literaryCategories.map((item, index) => {
            const Icon = item.icon;

            return (
              <Reveal key={item.title} delay={index * 0.1}>
                <Link
                  to={item.link}
                  className="group relative block h-full overflow-hidden border border-literary-gold/20 bg-literary-cream p-9 transition duration-500 hover:-translate-y-2 hover:border-literary-gold/60 hover:shadow-premium"
                >
                  <span className="absolute right-7 top-6 font-serif text-5xl text-literary-gold/20">
                    {item.number}
                  </span>

                  <div className="relative flex h-16 w-16 items-center justify-center border border-literary-gold/30 bg-white text-literary-emerald transition duration-500 group-hover:border-literary-gold group-hover:bg-literary-emerald group-hover:text-literary-gold">
                    <Icon size={27} strokeWidth={1.5} />
                  </div>

                  <h3 className="mt-8 font-serif text-2xl font-bold text-literary-navy transition group-hover:text-literary-emerald">
                    {item.title}
                  </h3>

                  <p className="mt-4 text-sm leading-8 text-literary-muted">
                    {item.description}
                  </p>

                  <div className="mt-8 flex items-center justify-between border-t border-literary-gold/20 pt-5">
                    <span className="text-xs font-bold uppercase tracking-[0.15em] text-literary-emerald">
                      {item.label}
                    </span>

                    <ArrowUpRight
                      size={19}
                      className="text-literary-gold transition duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                    />
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------
   AUTHOR PROFILE
------------------------------------------------------- */

function AuthorSection() {
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getPrimaryAuthor()
      .then((data) => {
        if (active) setAuthor(data);
      })
      .catch((error) => {
        console.error("Author profile error:", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const authorName = author?.fullName || "Muhammad Ijaz Ul Haq";
  const biography = author?.biography || "";

  return (
    <section className="relative overflow-hidden bg-literary-dark py-24 text-white sm:py-28">
      <div className="pointer-events-none absolute -right-40 top-0 h-[450px] w-[450px] rounded-full bg-literary-emerald opacity-40 blur-[120px]" />

      <Container>
        <div className="relative grid items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <SectionLabel>Meet the Author</SectionLabel>

            <h2 className="font-serif text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              {authorName}
            </h2>

            {author?.headline && (
              <p className="mt-5 font-semibold tracking-wide text-literary-gold">
                {author.headline}
              </p>
            )}

            <p className="mt-8 max-w-xl text-base leading-8 text-white/65">
              {loading
                ? "Loading author information..."
                : biography
                  ? biography.slice(0, 450) +
                    (biography.length > 450 ? "..." : "")
                  : "Explore the literary identity, published works and creative contributions of the author."}
            </p>

            {author?.location && (
              <p className="mt-5 text-sm text-white/45">
                {author.location}
              </p>
            )}

            <Link
              to="/authors"
              className="group mt-10 inline-flex items-center gap-3 bg-literary-gold px-7 py-4 text-sm font-bold text-literary-dark transition duration-300 hover:-translate-y-1 hover:bg-literary-gold-light"
            >
              Explore Author Profile
              <ArrowRight size={18} className="transition group-hover:translate-x-2" />
            </Link>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-4 border border-literary-gold/30" />

              <div className="relative aspect-square overflow-hidden border border-literary-gold/40 bg-gradient-to-br from-literary-emerald to-literary-dark p-5">
                {author?.profileImage ? (
                  <img
                    src={author.profileImage}
                    alt={authorName}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center border border-literary-gold/30 text-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border border-literary-gold/50 bg-literary-gold/10 text-literary-gold">
                      <PenTool size={46} strokeWidth={1} />
                    </div>

                    <p className="mt-8 px-3 font-serif text-3xl font-bold text-white">
                      {authorName}
                    </p>

                    <div className="mt-7 h-px w-20 bg-literary-gold" />

                    <p className="mt-5 text-[10px] uppercase tracking-[0.3em] text-white/60">
                      Author & Literary Platform
                    </p>
                  </div>
                )}
              </div>

              <div className="absolute -bottom-7 -left-7 hidden border border-literary-gold/30 bg-literary-emerald p-5 shadow-premium sm:block">
                <Feather size={28} className="text-literary-gold" />
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------
   CLOSING SECTION
------------------------------------------------------- */

function ClosingSection() {
  return (
    <section className="relative isolate overflow-hidden bg-literary-emerald py-24 text-center text-white sm:py-28">
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#D6B46B,transparent_55%)]" />
      </div>

      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full border border-literary-gold/20" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-[500px] w-[500px] rounded-full border border-literary-gold/20" />

      <Container>
        <Reveal>
          <div className="relative mx-auto max-w-3xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-literary-gold/40 bg-literary-gold/10 text-literary-gold">
              <Sparkles size={29} />
            </div>

            <p className="mt-8 text-xs font-bold uppercase tracking-[0.35em] text-literary-gold">
              Your Literary Journey Awaits
            </p>

            <h2 className="mt-6 font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Every Book Begins
              <span className="block text-literary-gold">
                a Journey.
              </span>
            </h2>

            <p className="mx-auto mt-7 max-w-xl text-base leading-8 text-white/65">
              Explore ideas, discover knowledge and experience the
              beauty of literature. Let every page take you somewhere new.
            </p>

            <Link
              to="/books"
              className="group mt-10 inline-flex items-center gap-3 bg-literary-gold px-9 py-4 text-sm font-bold text-literary-dark transition duration-300 hover:-translate-y-1 hover:bg-literary-gold-light"
            >
              Start Exploring
              <ArrowRight size={18} className="transition group-hover:translate-x-2" />
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------
   HOMEPAGE
------------------------------------------------------- */

export default function Home() {
  return (
    <div className="overflow-hidden">
      <HeroSection />
      <IntroductionSection />
      <FeaturedBooksSection />
      <LiteraryHighlightsSection />
      <LiteraryCategoriesSection />
      <AuthorSection />
      <ClosingSection />
    </div>
  );
}

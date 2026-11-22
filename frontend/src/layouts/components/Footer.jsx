
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Mail,
  ArrowUpRight,
  BookOpen,
  Globe,
  Feather,
  ArrowUp,
  Sparkles,
} from "lucide-react";

import Container from "../../components/ui/Container";
import Logo from "../../components/common/Logo";

const footerLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Books", path: "/books" },
  { label: "Literature", path: "/literature" },
  { label: "Authors", path: "/authors" },
  { label: "Contact", path: "/contact" },
];

const socialLinks = [
  {
    label: "Contact us",
    path: "/contact",
    icon: Mail,
  },
  {
    label: "Visit homepage",
    path: "/",
    icon: Globe,
  },
  {
    label: "Explore literature",
    path: "/literature",
    icon: Feather,
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-literary-dark text-white">

      {/* DECORATIVE BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-literary-emerald/40 blur-[100px]" />

        <div className="absolute -bottom-48 -left-32 h-96 w-96 rounded-full bg-literary-gold/10 blur-[100px]" />

        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <Container>
        {/* MAIN FOOTER */}
        <div className="grid gap-14 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 lg:py-24">

          {/* BRAND */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <Logo light />

            <div className="mt-7 flex items-center gap-3 text-literary-gold">
              <Sparkles size={16} />
              <span className="text-xs font-semibold uppercase tracking-[0.25em]">
                The Art of Literature
              </span>
            </div>

            <p className="mt-5 max-w-md text-sm leading-8 text-white/65">
              A literary destination dedicated to books,
              creative expression, knowledge and the
              exploration of literature. Discover timeless
              ideas and meaningful words through an elegant
              literary experience.
            </p>

            {/* SOCIAL / CONTACT LINKS */}
            <div className="mt-8 flex items-center gap-3">
              {socialLinks.map(({ label, path, icon: Icon }) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -5, rotate: -3 }}
                  whileTap={{ scale: 0.94 }}
                >
                  <Link
                    to={path}
                    aria-label={label}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-white/75 transition-all duration-300 hover:border-literary-gold/60 hover:bg-literary-gold hover:text-literary-dark"
                  >
                    <Icon size={19} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* EXPLORE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="mb-8 font-serif text-xl font-bold text-white">
              Explore
            </h3>

            <ul className="space-y-5">
              {footerLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="group inline-flex items-center gap-2 text-sm text-white/65 transition-colors duration-300 hover:text-literary-gold"
                  >
                    <span className="h-1 w-1 rounded-full bg-literary-gold/60 transition-all duration-300 group-hover:h-2 group-hover:w-2" />

                    {item.label}

                    <ArrowUpRight
                      size={14}
                      className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* CONTACT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="mb-8 font-serif text-xl font-bold text-white">
              Get in Touch
            </h3>

            <p className="text-sm leading-8 text-white/65">
              Have a question or want to learn more about
              the literary platform? We would love to hear
              from you.
            </p>

            <Link
              to="/contact"
              className="group mt-7 inline-flex items-center gap-3 rounded-xl border border-literary-gold/60 px-5 py-3.5 text-sm font-semibold text-literary-gold transition-all duration-300 hover:-translate-y-1 hover:bg-literary-gold hover:text-literary-dark hover:shadow-gold"
            >
              Contact Us

              <ArrowUpRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          </motion.div>
        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/10 py-8 text-center sm:flex-row sm:text-left">

          <p className="text-xs leading-6 text-white/45">
            © {currentYear} Muhammad Ijaz Ul Haq.
            All rights reserved.
          </p>

          <Link
            to="/"
            className="group flex items-center gap-2 text-xs text-white/55 transition-colors hover:text-literary-gold"
          >
            <BookOpen
              size={16}
              className="text-literary-gold transition-transform duration-300 group-hover:rotate-12"
            />

            Literary Platform
          </Link>

          <motion.button
            type="button"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.9 }}
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            aria-label="Back to top"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-literary-gold transition-all duration-300 hover:border-literary-gold hover:bg-literary-gold hover:text-literary-dark"
          >
            <ArrowUp size={19} />
          </motion.button>
        </div>
      </Container>
    </footer>
  );
}

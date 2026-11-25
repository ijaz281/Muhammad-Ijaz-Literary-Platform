
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  ArrowUpLeft,
  Globe,
  Feather,
  ArrowUp,
  Sparkles,
  BookOpen,
} from "lucide-react";

import Container from "../../components/ui/Container";
import Logo from "../../components/common/Logo";

const footerLinks = [
  { label: "صفحۂ اوّل", path: "/" },
  { label: "تعارف", path: "/about" },
  { label: "کتب", path: "/books" },
  { label: "ادب", path: "/literature" },
  { label: "مصنفین", path: "/authors" },
  { label: "رابطہ", path: "/contact" },
];

const socialLinks = [
  { label: "رابطہ کیجیے", path: "/contact", icon: Mail },
  { label: "مرکزی صفحہ", path: "/", icon: Globe },
  { label: "ادب دیکھیے", path: "/literature", icon: Feather },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      dir="rtl"
      className="relative isolate overflow-hidden bg-literary-dark text-white"
    >
      {/* DECORATIVE BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-literary-emerald/40 blur-[100px]" />
        <div className="absolute -right-32 -bottom-48 h-96 w-96 rounded-full bg-literary-gold/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <Container>
        {/* MAIN FOOTER */}
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 lg:py-20">
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
              <span className="font-urdu text-lg">علم و ادب کا خوبصورت جہان</span>
            </div>

            <p className="mt-5 max-w-xl font-urdu text-[19px] leading-[2.2] text-white/70">
              اعجازِ سخن ادبی پلیٹ فارم کتابوں، تخلیقی اظہار، علم اور ادب کے فروغ
              کے لیے ایک خوبصورت ڈیجیٹل جگہ ہے۔ یہاں تشریف لائیے، منتخب کتب
              دیکھیے اور لفظوں کی دنیا سے اپنا تعلق مضبوط بنائیے۔
            </p>

            {/* CONTACT / DISCOVERY LINKS */}
            <div className="mt-8 flex items-center gap-3">
              {socialLinks.map(({ label, path, icon: Icon }) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -5, rotate: 3 }}
                  whileTap={{ scale: 0.94 }}
                >
                  <Link
                    to={path}
                    aria-label={label}
                    title={label}
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
            <h3 className="mb-7 font-urdu text-2xl font-bold text-white">
              اہم روابط
            </h3>

            <ul className="space-y-4">
              {footerLinks.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="group inline-flex items-center gap-2 font-urdu text-lg text-white/70 transition-colors duration-300 hover:text-literary-gold"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-literary-gold/70 transition-all duration-300 group-hover:h-2 group-hover:w-2" />
                    {item.label}
                    <ArrowUpLeft
                      size={14}
                      className="opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100"
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
            <h3 className="mb-7 font-urdu text-2xl font-bold text-white">
              ہم سے رابطہ
            </h3>

            <p className="font-urdu text-lg leading-[2.2] text-white/70">
              کوئی سوال ہو یا ادبی پلیٹ فارم کے بارے میں مزید جاننا چاہتے ہوں؟
              ہمیں پیغام بھیجیے، آپ کی رائے ہمارے لیے اہم ہے۔
            </p>

            <Link
              to="/contact"
              className="group mt-7 inline-flex items-center gap-3 rounded-xl border border-literary-gold/60 px-5 py-3.5 font-urdu text-lg font-semibold text-literary-gold transition-all duration-300 hover:-translate-y-1 hover:bg-literary-gold hover:text-literary-dark hover:shadow-gold"
            >
              رابطہ کیجیے
              <ArrowUpLeft
                size={17}
                className="transition-transform duration-300 group-hover:-translate-x-1 group-hover:-translate-y-1"
              />
            </Link>
          </motion.div>
        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col items-center justify-between gap-5 border-t border-white/10 py-7 text-center sm:flex-row sm:text-right">
          <p className="font-urdu text-base leading-8 text-white/50">
            © {currentYear} اعجازِ سخن۔ جملہ حقوق محفوظ ہیں۔
          </p>
          

          <Link
            to="/"
            className="group flex items-center gap-2 font-urdu text-base text-white/60 transition-colors hover:text-literary-gold"
          >
            <BookOpen
              size={16}
              className="text-literary-gold transition-transform duration-300 group-hover:rotate-12"
            />
            ادبی پلیٹ فارم
          </Link>
          <p className="text-sm text-white/60 text-center">
          Developed by:{" "}
          <span className="font-semibold text-literary-gold">
          MMProgrammix
          </span>
          <span className="mx-1"> | </span>
          <span className="text-white/80">
          Mr. Mubashar Ahmed Rabbani
          </span>
</p>

          <motion.button
            type="button"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.9 }}
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
            aria-label="صفحے کے آغاز پر جائیں"
            title="اوپر جائیں"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-literary-gold transition-all duration-300 hover:border-literary-gold hover:bg-literary-gold hover:text-literary-dark"
          >
            <ArrowUp size={19} />
          </motion.button>
        </div>
      </Container>
    </footer>
  );
}

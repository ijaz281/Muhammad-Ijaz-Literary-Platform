import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
  ArrowUpLeft,
} from "lucide-react";

import Logo from "../../components/common/Logo";
import Button from "../../components/ui/Button";
import Container from "../../components/ui/Container";
import { mainNavigation } from "../../data/navigation";

const menuVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.3, ease: "easeOut" },
  },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
};

const urduNavigation = {
  "/": "صفحۂ اوّل",
  "/about": "تعارف",
  "/books": "کتب",
  "/literature": "ادب",
  "/authors": "مصنفین",
  "/contact": "رابطہ",
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `relative text-[17px] font-medium transition-colors duration-300 ${
      isActive
        ? "text-literary-gold"
        : "text-white/80 hover:text-literary-gold"
    }`;

  function closeMenu() {
    setMenuOpen(false);
  }

  const iconLinks = [
    { to: "/search", label: "تلاش", icon: Search },
    { to: "/account", label: "اکاؤنٹ", icon: UserRound },
    { to: "/cart", label: "خریداری کی ٹوکری", icon: ShoppingBag },
  ];

  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      dir="rtl"
      className="sticky top-0 z-50 border-b border-literary-gold/20 bg-literary-navy/95 text-white shadow-lg backdrop-blur-xl"
    >
      <Container>
        <div className="flex min-h-[88px] items-center justify-between gap-4">
          {/* BRAND */}
          <div className="shrink-0 transition-transform duration-300 hover:scale-[1.02]">
            <Logo light onClick={closeMenu} />
          </div>

          {/* DESKTOP NAVIGATION */}
          <nav
            aria-label="بنیادی نیویگیشن"
            className="hidden items-center gap-5 xl:gap-7 lg:flex"
          >
            {mainNavigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={linkClass}
              >
                {({ isActive }) => (
                  <span className="group relative block py-3 font-urdu">
                    {urduNavigation[item.path] || item.label}
                    <motion.span
                      initial={false}
                      animate={{ scaleX: isActive ? 1 : 0 }}
                      className="absolute bottom-0 right-0 h-[2px] w-full origin-right rounded-full bg-literary-gold"
                    />
                    {!isActive && (
                      <span className="absolute bottom-0 right-0 h-[2px] w-full origin-right scale-x-0 rounded-full bg-literary-gold transition-transform duration-300 group-hover:scale-x-100" />
                    )}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="hidden items-center gap-2 xl:gap-3 lg:flex">
            {iconLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                aria-label={label}
                title={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-all duration-300 hover:-translate-y-1 hover:border-literary-gold/70 hover:bg-white/10 hover:text-literary-gold"
              >
                <Icon size={18} />
              </Link>
            ))}

            <Link to="/books" className="mr-1">
              <Button size="sm">
                <span className="font-urdu">کتب دیکھیے</span>
              </Button>
            </Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setMenuOpen((previous) => !previous)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 text-white transition hover:border-literary-gold hover:text-literary-gold lg:hidden"
            aria-label={menuOpen ? "مینو بند کریں" : "مینو کھولیں"}
            aria-expanded={menuOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={menuOpen ? "close" : "open"}
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.18 }}
              >
                {menuOpen ? <X size={23} /> : <Menu size={23} />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </Container>

      {/* MOBILE NAVIGATION */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="overflow-hidden border-t border-white/10 bg-literary-dark lg:hidden"
          >
            <Container>
              <nav aria-label="موبائل نیویگیشن" className="flex flex-col py-3">
                {mainNavigation.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.045 }}
                  >
                    <NavLink
                      to={item.path}
                      end={item.path === "/"}
                      onClick={closeMenu}
                      className={({ isActive }) =>
                        `flex items-center justify-between border-b border-white/10 py-4 text-[18px] font-medium font-urdu transition ${
                          isActive
                            ? "text-literary-gold"
                            : "text-white/85 hover:text-literary-gold"
                        }`
                      }
                    >
                      {urduNavigation[item.path] || item.label}
                      <ArrowUpLeft size={16} />
                    </NavLink>
                  </motion.div>
                ))}

                <div className="flex items-center gap-4 border-b border-white/10 py-5">
                  {iconLinks.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={closeMenu}
                      aria-label={label}
                      title={label}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-literary-gold hover:text-literary-gold"
                    >
                      <Icon size={19} />
                    </Link>
                  ))}
                </div>

                <Link to="/books" onClick={closeMenu} className="mt-5">
                  <Button size="sm" block>
                    <span className="font-urdu">کتب دیکھیے</span>
                  </Button>
                </Link>
              </nav>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

import { Link } from "react-router-dom";
import logoImage from "../../assets/images/ijaz-ul-haq-logo.jfif";

export default function Logo({ light = false, onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="اعجاز الحق، مرکزی صفحہ"
      className="group inline-flex items-center gap-2.5"
      dir="rtl"
    >
      <img
        src={logoImage}
        alt="اعجاز الحق کا لوگو"
        className="h-[58px] w-[58px] shrink-0 rounded-full object-cover ring-1 ring-literary-gold/60 shadow-lg transition-transform duration-300 group-hover:scale-105 sm:h-[66px] sm:w-[66px]"
      />

      <span className="flex flex-col items-start">
        <span
          className={`font-urdu text-[23px] font-bold leading-[1.7] sm:text-[26px] ${
            light ? "text-white" : "text-literary-navy"
          }`}
        >
          محمد اعجاز الحق
        </span>
        <span className="font-urdu text-[14px] leading-7 text-literary-gold">
          ادبی پلیٹ فارم
        </span>
      </span>
    </Link>
  );
}


import { Link } from "react-router-dom";

export default function Logo({ light = false, onClick }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="Muhammad Ijaz Ul Haq home"
      className="group inline-flex items-center gap-3"
    >
      <div className="flex h-11 w-11 items-center justify-center border border-literary-gold">
        <span className="font-serif text-2xl font-bold text-literary-gold">
          I
        </span>
      </div>

      <div>
        <h1
          className={`font-serif text-base font-bold tracking-wide sm:text-lg ${
            light ? "text-white" : "text-literary-navy"
          }`}
        >
          Muhammad Ijaz Ul Haq
        </h1>

        <p className="mt-0.5 text-[9px] uppercase tracking-[0.25em] text-literary-gold">
          Literary Platform
        </p>
      </div>
    </Link>
  );
}

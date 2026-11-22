
import { forwardRef } from "react";

const variants = {
  primary:
    "bg-literary-gold text-literary-navy hover:bg-literary-gold-dark",
  secondary:
    "border border-literary-navy text-literary-navy hover:bg-literary-navy hover:text-white",
  dark:
    "bg-literary-navy text-white hover:bg-literary-dark",
  light:
    "bg-white text-literary-navy hover:bg-literary-cream",
  ghost:
    "text-literary-navy hover:bg-literary-cream",
};

const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    className = "",
    type = "button",
    block = false,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={[
        "inline-flex items-center justify-center gap-2",
        "rounded-sm font-semibold tracking-wide",
        "transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-literary-gold",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        block ? "w-full" : "",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;

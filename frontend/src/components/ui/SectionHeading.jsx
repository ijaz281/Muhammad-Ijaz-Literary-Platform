export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}) {
  const alignment = {
    center: "text-center mx-auto",
    left: "text-left",
    right: "text-right",
  };

  return (
    <div className={`max-w-2xl ${alignment[align]} ${className}`}>
      {eyebrow && (
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-literary-gold">
          {eyebrow}
        </p>
      )}

      <h2 className="font-serif text-3xl font-bold leading-tight text-literary-navy sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      {description && (
        <p className="mt-5 text-base leading-8 text-literary-muted">
          {description}
        </p>
      )}
    </div>
  );
}
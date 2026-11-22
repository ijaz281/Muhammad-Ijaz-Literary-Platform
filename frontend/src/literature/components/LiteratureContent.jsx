
export default function LiteratureContent({ item }) {
  const isUrdu = item.language === "ur";

  return (
    <article
      dir={isUrdu ? "rtl" : "ltr"}
      lang={isUrdu ? "ur" : "en"}
      className={`mx-auto max-w-4xl whitespace-pre-wrap text-gray-800 ${
        isUrdu
          ? "urdu-content text-xl"
          : "text-left text-lg leading-9"
      }`}
      style={{
        unicodeBidi: "plaintext",
        overflowWrap: "break-word",
        textAlign: isUrdu ? "right" : "left",
      }}
    >
      {item.content}
    </article>
  );
}

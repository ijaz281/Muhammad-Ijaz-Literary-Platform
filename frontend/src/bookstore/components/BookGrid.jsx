
import BookCard from "./BookCard";

export default function BookGrid({ books }) {
  if (!books.length) {
    return (
      <div className="rounded-2xl bg-gray-50 py-20 text-center">
        <h3 className="text-xl font-bold text-gray-800">
          No Books Found
        </h3>
        <p className="mt-2 text-gray-500">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}

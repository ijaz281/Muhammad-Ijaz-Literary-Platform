
import LiteratureCard from "./LiteratureCard";

export default function LiteratureGrid({ items = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((number) => (
          <div
            key={number}
            className="animate-pulse overflow-hidden rounded-2xl border border-gray-200 bg-white p-6"
          >
            <div className="mb-5 h-5 w-24 rounded bg-gray-200" />
            <div className="mb-4 h-7 w-3/4 rounded bg-gray-200" />
            <div className="mb-2 h-4 w-full rounded bg-gray-200" />
            <div className="mb-2 h-4 w-5/6 rounded bg-gray-200" />
            <div className="mt-6 h-5 w-32 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
        <h3 className="mb-2 text-xl font-bold text-literary-navy">
          No Publications Found
        </h3>

        <p className="text-gray-600">
          Literary publications will appear here when they become available.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <LiteratureCard
          key={item.id ?? item.slug}
          item={item}
        />
      ))}
    </div>
  );
}


import { Search, X } from "lucide-react";

export default function BookFilters({
  search,
  setSearch,
  category,
  setCategory,
  categories = [],
}) {
  return (
    <div className="mb-10 grid gap-5 border border-gray-200 bg-white p-5 sm:p-7 md:grid-cols-2">
      <div>
        <label
          htmlFor="book-search"
          className="mb-3 block text-xs font-bold uppercase tracking-wider text-literary-navy"
        >
          ذخیرے میں تلاش کریں
        </label>

        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={19}
          />

          <input
            id="book-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="کتاب کے عنوان، مصنف یا تعارف سے تلاش کریں..."
            className="w-full border border-gray-200 bg-literary-cream py-4 pl-12 pr-4 text-sm outline-none transition focus:border-literary-gold"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="book-category"
          className="mb-3 block text-xs font-bold uppercase tracking-wider text-literary-navy"
        >
          صنف کے مطابق ترتیب دیں
        </label>

        <div className="flex gap-3">
          <select
            id="book-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full border border-gray-200 bg-literary-cream px-4 py-4 text-sm outline-none transition focus:border-literary-gold"
          >
            <option value="">تمام اصناف</option>

            {categories.map((item) => (
              <option
                key={item.id}
                value={item.slug || item.id}
              >
                {item.name}
              </option>
            ))}
          </select>

          {(search || category) && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("");
              }}
              className="flex shrink-0 items-center gap-2 border border-gray-200 px-4 text-sm text-gray-600 transition hover:border-literary-gold hover:text-literary-navy"
              title="فلٹرز ختم کریں"
              aria-label="فلٹرز ختم کریں"
            >
              <X size={18} />
              <span className="hidden sm:inline">صاف کریں</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

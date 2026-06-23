"use client";

import MaterialIcon from "./MaterialIcon";

type ClientCatalogFiltersProps = {
  categories: string[];
  availableCategories: string[];
  categoryCounts: Record<string, number>;
  onCategoryToggle: (category: string) => void;
};

export default function ClientCatalogFilters({
  categories,
  availableCategories,
  categoryCounts,
  onCategoryToggle
}: ClientCatalogFiltersProps) {

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="sticky top-24 space-y-lg">
        {/* Categorías */}
        <div>
          <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-md flex items-center gap-2">
            <MaterialIcon name="category" className="text-[20px]" />
            Categorías
          </h3>
          <ul className="space-y-sm">
            <li key="todas">
              <button
                onClick={() => {
                  categories.forEach(cat => onCategoryToggle(cat));
                }}
                className="flex items-center gap-sm cursor-pointer group text-left w-full"
              >
                <span
                  className={`text-body-md transition-colors ${categories.length === 0
                    ? "text-primary font-bold"
                    : "text-secondary group-hover:text-primary"
                    }`}
                >
                  Todas
                </span>
              </button>
            </li>
            {availableCategories.map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => onCategoryToggle(cat)}
                  className="flex items-center justify-between cursor-pointer group text-left w-full"
                >
                  <span
                    className={`text-body-md transition-colors ${categories.includes(cat)
                      ? "text-primary font-bold"
                      : "text-secondary group-hover:text-primary"
                      }`}
                  >
                    {cat}
                  </span>
                  <span className={`text-[10px] rounded px-2 py-0.5 font-bold transition-colors ${categories.includes(cat)
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-secondary group-hover:bg-primary-container group-hover:text-on-primary-container"
                    }`}>
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
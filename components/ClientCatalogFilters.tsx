"use client";

type ClientCatalogFiltersProps = {
  categories: string[];
  maxPrice: number;
  availableCategories: string[];
  onCategoryToggle: (category: string) => void;
  onPriceChange: (price: number) => void;
};

export default function ClientCatalogFilters({
  categories,
  maxPrice,
  availableCategories,
  onCategoryToggle,
  onPriceChange
}: ClientCatalogFiltersProps) {

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="sticky top-24 space-y-lg">
        {/* Categorías */}
        <div>
          <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-md">
            Categorías
          </h3>
          <ul className="space-y-sm">
            {availableCategories.map((cat) => (
              <li key={cat}>
                <label className="flex items-center gap-sm cursor-pointer group">
                  <input
                    checked={categories.includes(cat)}
                    onChange={() => onCategoryToggle(cat)}
                    className="rounded-sm border-secondary-fixed-dim text-primary focus:ring-primary"
                    type="checkbox"
                  />
                  <span
                    className={`text-body-md transition-colors ${
                      categories.includes(cat)
                        ? "text-on-surface group-hover:text-primary"
                        : "text-secondary group-hover:text-primary"
                    }`}
                  >
                    {cat}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        {/* Rango de Precios */}
        <div>
          <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-md">
            Rango de Precios
          </h3>
          <input
            className="w-full accent-primary bg-surface-container-highest h-1 rounded-full appearance-none cursor-pointer"
            type="range"
            min={0}
            max={5000000}
            step={100000}
            value={maxPrice}
            onChange={(e) => onPriceChange(Number(e.target.value))}
          />
          <div className="flex justify-between mt-sm text-caption text-secondary">
            <span>$0</span>
            <span>${Math.floor(maxPrice / 1000)}k</span>
            <span>$5.000.000+</span>
          </div>
        </div>

        {/* Botón para resetear */}
        <div>
          <button
            onClick={() => {
              // Desmarcar todas las categorías
              categories.forEach(cat => {
                onCategoryToggle(cat);
              });
              // Restablecer precio máximo
              onPriceChange(5000000);
            }}
            className="w-full bg-surface-container text-on-surface-variant py-2 rounded-lg text-caption font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
          >
            Restablecer filtros
          </button>
        </div>
      </div>
    </aside>
  );
}
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { CATEGORIES, CUT_TYPES, GRADES } from "@/lib/utils";

export default function CatalogFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<string[]>(() => {
    const cat = searchParams.get("category");
    return cat ? cat.split(",") : ["Beef & Veal"];
  });
  const [cuts, setCuts] = useState<string[]>(() => {
    const cut = searchParams.get("cut");
    return cut ? cut.split(",") : ["Steak"];
  });
  const [grade, setGrade] = useState(searchParams.get("grade") ?? "");
  const [maxPrice, setMaxPrice] = useState(
    Number(searchParams.get("maxPrice") ?? 5000000),
  );

  const applyFilters = useCallback(
    (updates: {
      categories?: string[];
      cuts?: string[];
      grade?: string;
      maxPrice?: number;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      const cats = updates.categories ?? categories;
      const cutList = updates.cuts ?? cuts;
      const g = updates.grade ?? grade;
      const price = updates.maxPrice ?? maxPrice;

      if (cats.length) params.set("category", cats.join(","));
      else params.delete("category");
      if (cutList.length) params.set("cut", cutList.join(","));
      else params.delete("cut");
      if (g) params.set("grade", g);
      else params.delete("grade");
      if (price < 5000000) params.set("maxPrice", String(price));
      else params.delete("maxPrice");
      params.delete("page");

      router.push(`/?${params.toString()}`);
    },
    [categories, cuts, grade, maxPrice, router, searchParams],
  );

  const toggleCategory = (cat: string) => {
    const next = categories.includes(cat)
      ? categories.filter((c) => c !== cat)
      : [...categories, cat];
    setCategories(next);
    applyFilters({ categories: next });
  };

  const toggleCut = (cut: string) => {
    const next = cuts.includes(cut)
      ? cuts.filter((c) => c !== cut)
      : [...cuts, cut];
    setCuts(next);
    applyFilters({ cuts: next });
  };

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="sticky top-24 space-y-lg">
        <div>
          <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-md">
            Categorías
          </h3>
          <ul className="space-y-sm">
            {CATEGORIES.map((cat) => (
              <li key={cat}>
                <label className="flex items-center gap-sm cursor-pointer group">
                  <input
                    checked={categories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
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

        <div>
          <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-md">
            Cortes
          </h3>
          <div className="flex flex-wrap gap-xs">
            {CUT_TYPES.map((cut) => (
              <button
                key={cut}
                type="button"
                onClick={() => toggleCut(cut)}
                className={
                  cuts.includes(cut)
                    ? "bg-primary-container text-on-primary-container px-sm py-xs rounded-lg text-caption font-semibold cursor-pointer"
                    : "bg-surface-container text-on-surface-variant px-sm py-xs rounded-lg text-caption font-semibold hover:bg-primary-container hover:text-on-primary-container transition-colors cursor-pointer"
                }
              >
                {cut}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-md">
            Rango de Precios
          </h3>
          <input
            className="w-full accent-primary bg-surface-container-highest h-1 rounded-full appearance-none cursor-pointer"
            type="range"
            min={0}
            max={5000000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            onMouseUp={() => applyFilters({ maxPrice })}
            onTouchEnd={() => applyFilters({ maxPrice })}
          />
          <div className="flex justify-between mt-sm text-caption text-secondary">
            <span>$0</span>
            <span>$5.000.000+</span>
          </div>
        </div>

        {/* <div>
          <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-md">
            Grado de Carne
          </h3>
          <ul className="space-y-sm">
            {GRADES.map((g) => (
              <li key={g}>
                <label className="flex items-center gap-sm cursor-pointer group">
                  <input
                    type="radio"
                    name="grade"
                    checked={grade === g}
                    onChange={() => {
                      setGrade(g);
                      applyFilters({ grade: g });
                    }}
                    className="text-primary focus:ring-primary border-secondary-fixed-dim"
                  />
                  <span className="text-body-md text-secondary group-hover:text-primary">
                    {g}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div> */}
      </div>
    </aside>
  );
}

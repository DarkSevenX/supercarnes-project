"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "", label: "Más Popular" },
  { value: "price_desc", label: "Precio: Mayor a Menor" },
  { value: "price_asc", label: "Precio: Menor a Mayor" },
  { value: "newest", label: "Nuevos Productos" },
];

export default function CatalogSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("sort", value);
    else params.delete("sort");
    params.delete("page");
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-md">
      <span className="text-caption font-label-md text-secondary uppercase">
        Ordenar Por:
      </span>
      <select
        className="border-none bg-transparent font-label-md text-on-surface focus:ring-0 cursor-pointer"
        value={current}
        onChange={(e) => handleChange(e.target.value)}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value || "default"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

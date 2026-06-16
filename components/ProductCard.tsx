"use client";

import Image from "next/image";
import { useTransition } from "react";
import { parseBadges, formatCOP } from "@/lib/utils";
import { addToCart } from "@/lib/actions/cart-actions";
import MaterialIcon from "./MaterialIcon";

type ProductCardProps = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  priceUnit: string;
  imageUrl: string;
  badges: string | null;
};

function badgeClass(badge: string) {
  const lower = badge.toLowerCase();
  if (lower.includes("wagyu") || lower.includes("exclusive"))
    return "bg-tertiary text-on-tertiary";
  if (lower.includes("prime") || lower.includes("dry-aged"))
    return "bg-tertiary-container text-on-tertiary-container";
  if (lower.includes("chef"))
    return "bg-primary text-on-primary";
  if (lower.includes("pitmaster"))
    return "bg-surface-container-highest text-on-surface-variant";
  return "bg-primary-container text-on-primary-container";
}

export default function ProductCard({
  id,
  name,
  category,
  description,
  price,
  priceUnit,
  imageUrl,
  badges,
}: ProductCardProps) {
  const [isPending, startTransition] = useTransition();
  const badgeList = parseBadges(badges);

  const handleAddToCart = () => {
    startTransition(async () => {
      await addToCart(id, 1);
    });
  };

  return (
    <div className="bg-surface-container-lowest rounded-lg overflow-hidden product-card-shadow flex flex-col transition-all duration-300 group">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
        <Image
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          src={imageUrl}
          alt={name}
          width={400}
          height={300}
          unoptimized
        />
        {badgeList.length > 0 && (
          <div className="absolute top-4 left-4 flex gap-2">
            {badgeList.map((badge) => (
              <span
                key={badge}
                className={`${badgeClass(badge)} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter`}
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="p-lg flex flex-col flex-1">
        <span className="text-caption font-label-md text-secondary uppercase mb-xs">
          {category}
        </span>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">
          {name}
        </h3>
        <p className="text-body-md text-secondary line-clamp-2 mb-md">
          {description}
        </p>
        <div className="mt-auto pt-md flex justify-between items-center border-t border-surface-container">
          <span className="font-bold text-headline-md text-primary">
            {formatCOP(price)}{" "}
            <small className="font-normal text-caption text-secondary">
              / {priceUnit}
            </small>
          </span>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isPending}
            className="bg-inverse-surface text-on-secondary px-lg py-sm rounded-lg font-label-md hover:bg-primary transition-colors cursor-pointer active:scale-95 flex items-center gap-sm disabled:opacity-60"
          >
            <MaterialIcon name="shopping_basket" className="text-[18px]" />
            {isPending ? "..." : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}

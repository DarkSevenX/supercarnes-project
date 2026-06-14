import type { CSSProperties, ReactNode } from "react";

type MaterialIconProps = {
  name: string;
  className?: string;
  fill?: boolean;
  style?: CSSProperties;
  children?: ReactNode;
};

export default function MaterialIcon({
  name,
  className = "",
  fill = false,
  style,
}: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0",
        ...style,
      }}
    >
      {name}
    </span>
  );
}

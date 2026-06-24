"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value?: number;                       // 0 / undefined = unrated, 1-5 = rated
  onChange?: (rating: number) => void;  // undefined = readonly
  size?: "xs" | "sm" | "md";
}

const SIZE = {
  xs: "w-2.5 h-2.5",
  sm: "w-3.5 h-3.5",
  md: "w-4.5 h-4.5",
};

export default function StarRating({ value = 0, onChange, size = "sm" }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const readonly = !onChange;
  const active = hovered || value;

  return (
    <div
      className={`flex items-center gap-0.5 ${readonly ? "" : "cursor-pointer"}`}
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(value === star ? 0 : star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          className={`transition-all ${readonly ? "pointer-events-none" : "hover:scale-110 active:scale-95"}`}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={`${SIZE[size]} transition-colors duration-100 ${
              star <= active
                ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.4)]"
                : readonly
                  ? "text-slate-800"
                  : "text-slate-700 hover:text-amber-600"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

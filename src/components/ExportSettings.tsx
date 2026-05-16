"use client";

import { EditRecipe } from "@/lib/types";
import {
  SlidersHorizontal,
  Info as InfoIcon,
} from "lucide-react";

import {
  estimateExportSize,
  formatEstimatedSize,
} from "@/lib/exportEstimate";

interface Props {
  recipe: EditRecipe;
  duration: number;
  onChange: (
    patch: Partial<EditRecipe>
  ) => void;
}

export default function ExportSettings({
  recipe,
  duration,
  onChange,
}: Props) {
  const label =
    recipe.quality <= 21
      ? "High"
      : recipe.quality <= 25
      ? "Balanced"
      : "Small file";

  const estimatedSize =
    formatEstimatedSize(
      estimateExportSize(
        recipe,
        duration
      )
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="quality-control"
          className="text-[10px] font-heading font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1"
        >
          <SlidersHorizontal size={10} />

          Quality

          <span
            className="cursor-help"
            title="CRF (Constant Rate Factor): lower = higher quality, larger file. 18 = best quality, 30 = smallest file."
          >
            <InfoIcon size={14} />
          </span>
        </label>

        <span className="text-sm font-heading font-bold text-film-600">
          {label}

          <span className="font-normal text-xs text-[var(--muted)] ml-1">
            CRF {recipe.quality}
          </span>
        </span>
      </div>

      <input
        id="quality-control"
        type="range"
        min={18}
        max={30}
        step={1}
        value={recipe.quality}
        onChange={(e) =>
          onChange({
            quality: Number(
              e.target.value
            ),
          })
        }
        aria-label="Video export quality (CRF)"
        aria-valuetext={`${label} quality, CRF value ${recipe.quality}`}
        className="w-full accent-film-600 cursor-pointer"
      />

      <div className="mt-1 space-y-3">
        <div className="flex justify-between">
          <span className="text-[10px] text-[var(--muted)]">
            Best quality
          </span>

          <span className="text-[10px] text-[var(--muted)]">
            Smallest file
          </span>
        </div>

        <p className="text-xs text-[var(--muted)]">
          Estimated size:{" "}
          <span className="font-semibold text-[var(--text)]">
            {estimatedSize}
          </span>
        </p>
      </div>
    </div>
  );
}
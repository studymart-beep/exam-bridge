"use client";

import type { Material } from "@/types";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface MaterialRowProps {
  material: Material;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const typeLabel: Record<Material["type"], string> = {
  video: "Video",
  pdf: "PDF",
  image: "Image",
};

const typeVariant: Record<Material["type"], "info" | "warning" | "success"> = {
  video: "info",
  pdf: "warning",
  image: "success",
};

function TypeIcon({ type }: { type: Material["type"] }) {
  if (type === "video") {
    return (
      <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (type === "pdf") {
    return (
      <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

export default function MaterialRow({
  material,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: MaterialRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white rounded-2xl border border-border shadow-soft">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-primary-light/40 flex items-center justify-center flex-shrink-0">
          <TypeIcon type={material.type} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-text-primary truncate">{material.title}</p>
            <Badge variant={typeVariant[material.type]} size="sm">
              {typeLabel[material.type]}
            </Badge>
          </div>
          <p className="text-xs text-text-muted truncate mt-0.5">
            {material.source} · order {material.orderIndex}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        <button
          type="button"
          onClick={onMoveUp}
          className="p-2 rounded-lg text-text-muted hover:bg-primary-light text-xs"
          aria-label="Move up"
        >
          ↑
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          className="p-2 rounded-lg text-text-muted hover:bg-primary-light text-xs"
          aria-label="Move down"
        >
          ↓
        </button>
        <Button size="sm" variant="ghost" onClick={onEdit}>
          Edit
        </Button>
        <Button size="sm" variant="ghost" className="text-error" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}

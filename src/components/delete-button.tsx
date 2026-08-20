"use client";

import { useTransition } from "react";

export default function DeleteButton({
  onDelete,
  confirmMessage,
}: {
  onDelete: () => Promise<void>;
  confirmMessage: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      className="text-xs text-muted hover:text-amber"
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm(confirmMessage)) return;
        startTransition(async () => {
          await onDelete();
        });
      }}
    >
      {isPending ? "Removing…" : "Remove"}
    </button>
  );
}

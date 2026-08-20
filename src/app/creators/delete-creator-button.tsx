"use client";

import { useState, useTransition } from "react";
import { deleteCreator } from "./actions";

export default function DeleteCreatorButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="text-right">
      <button
        className="text-xs text-muted hover:text-amber"
        disabled={isPending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            const result = await deleteCreator(id);
            if (!result.ok && result.error) setError(result.error);
          });
        }}
      >
        {isPending ? "Removing…" : "Remove"}
      </button>
      {error && <div className="text-xs text-amber mt-1 max-w-xs">{error}</div>}
    </div>
  );
}

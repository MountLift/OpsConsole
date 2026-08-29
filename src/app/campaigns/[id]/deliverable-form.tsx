"use client";

import { useRef, useState, useTransition } from "react";
import { addDeliverable } from "../actions";

const TYPES = ["POST", "REEL", "STORY", "VIDEO", "LIVESTREAM", "OTHER"];

export default function DeliverableForm({
  campaignId,
  creators,
  showRate = true,
}: {
  campaignId: string;
  creators: { id: string; name: string }[];
  showRate?: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          setError(null);
          const result = await addDeliverable(campaignId, formData);
          if (result?.error) setError(result.error);
          else formRef.current?.reset();
        });
      }}
      className="card p-4 mb-6"
    >
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${showRate ? "xl:grid-cols-4" : "xl:grid-cols-3"} gap-3`}>
      <select className="input" name="creatorId" required defaultValue="">
        <option value="" disabled>
          Select creator
        </option>
        {creators.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <select className="input" name="type" defaultValue="POST">
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      {showRate && (
        <input className="input" name="agreedRate" placeholder="Agreed rate" type="number" min="0" />
      )}
      <label className="space-y-1">
        <span className="text-xs text-muted">Due date</span>
        <input className="input" name="dueDate" type="date" />
      </label>
      <button className="btn" disabled={isPending}>
        {isPending ? "Adding…" : "Add deliverable"}
      </button>
      </div>
      {error && <p className="mt-3 text-xs text-amber">{error}</p>}
    </form>
  );
}

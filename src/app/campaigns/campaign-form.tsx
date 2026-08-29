"use client";

import { useRef, useState, useTransition } from "react";
import { createCampaign } from "./actions";

export default function CampaignForm({
  brands,
  showBudget = true,
}: {
  brands: { id: string; name: string }[];
  showBudget?: boolean;
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
          const result = await createCampaign(formData);
          if (result?.error) setError(result.error);
          else formRef.current?.reset();
        });
      }}
      className="card p-4 mb-6"
    >
      <div className="text-xs text-muted mb-3">
        Quick setup: choose a name and brand first. Budget is optional and can be adjusted later.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <label className="space-y-1">
          <span className="text-xs text-muted">Campaign name *</span>
          <input className="input" name="name" placeholder="e.g. Summer Launch 2026" required />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted">Brand *</span>
          <select className="input" name="brandId" required defaultValue="">
            <option value="" disabled>
              Select brand
            </option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        {showBudget && (
          <label className="space-y-1">
            <span className="text-xs text-muted">Budget (optional)</span>
            <input className="input" name="budget" placeholder="e.g. 50000" type="number" min="0" />
          </label>
        )}
        <label className="space-y-1">
          <span className="text-xs text-muted">Campaign start</span>
          <input className="input" name="startDate" type="date" />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted">Brand due date</span>
          <input className="input" name="endDate" type="date" />
        </label>
      </div>
      {error && <p className="mt-3 text-xs text-amber">{error}</p>}
      <div className="mt-4">
        <button className="btn" disabled={isPending}>
          {isPending ? "Creating…" : "Create campaign"}
        </button>
      </div>
    </form>
  );
}

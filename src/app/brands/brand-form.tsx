"use client";

import { useRef, useTransition } from "react";
import { createBrand } from "./actions";

export default function BrandForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await createBrand(formData);
          formRef.current?.reset();
        });
      }}
      className="card p-4 mb-6"
    >
      <div className="text-xs text-muted mb-3">
        Start with the brand name. Contact details can be updated later.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <label className="space-y-1">
          <span className="text-xs text-muted">Brand name *</span>
          <input className="input" name="name" placeholder="e.g. Nike India" required />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted">Contact person</span>
          <input className="input" name="contactName" placeholder="e.g. Priya Sharma" />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted">Contact email</span>
          <input className="input" name="contactEmail" placeholder="e.g. priya@brand.com" type="email" />
        </label>
      </div>
      <div className="mt-4">
        <button className="btn" disabled={isPending}>
          {isPending ? "Adding…" : "Add brand"}
        </button>
      </div>
    </form>
  );
}

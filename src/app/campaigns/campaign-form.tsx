"use client";

import { useRef, useTransition } from "react";
import { createCampaign } from "./actions";

export default function CampaignForm({ brands }: { brands: { id: string; name: string }[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await createCampaign(formData);
          formRef.current?.reset();
        });
      }}
      className="card p-4 grid grid-cols-4 gap-3 mb-6"
    >
      <input className="input" name="name" placeholder="Campaign name" required />
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
      <input className="input" name="budget" placeholder="Budget" type="number" min="0" />
      <button className="btn" disabled={isPending}>
        {isPending ? "Creating…" : "Create campaign"}
      </button>
    </form>
  );
}

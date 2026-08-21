"use client";

import { useState } from "react";
import DeleteButton from "@/components/delete-button";
import { updateBrand, deleteBrand } from "./actions";

type Brand = {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  _count: { campaigns: number };
};

export default function BrandRow({ brand }: { brand: Brand }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form
        action={async (formData) => {
          await updateBrand(brand.id, formData);
          setEditing(false);
        }}
        className="grid grid-cols-4 gap-3 px-4 py-3"
      >
        <input className="input" name="name" defaultValue={brand.name} required />
        <input className="input" name="contactName" defaultValue={brand.contactName ?? ""} placeholder="Contact name" />
        <input className="input" name="contactEmail" defaultValue={brand.contactEmail ?? ""} placeholder="Contact email" type="email" />
        <div className="flex gap-2">
          <button className="btn" type="submit">Save</button>
          <button
            type="button"
            className="text-xs text-muted hover:text-amber"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="table-row flex items-center justify-between px-4 py-3 text-sm">
      <div>
        <div className="font-medium">{brand.name}</div>
        <div className="text-muted text-xs">
          {brand.contactName ?? "no contact set"} · {brand._count.campaigns} campaigns
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-xs text-muted hover:text-lift" onClick={() => setEditing(true)}>
          Edit
        </button>
        <DeleteButton
          onDelete={deleteBrand.bind(null, brand.id)}
          confirmMessage={`Remove ${brand.name}? This also removes its ${brand._count.campaigns} campaign${brand._count.campaigns === 1 ? "" : "s"} and everything linked to them (deliverables, payouts, invoices).`}
        />
      </div>
    </div>
  );
}

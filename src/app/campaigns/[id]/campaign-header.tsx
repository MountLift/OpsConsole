"use client";

import { useState } from "react";
import { updateCampaign } from "../actions";

const STATUSES = ["PLANNING", "ACTIVE", "COMPLETE", "CANCELLED"];

type Campaign = {
  id: string;
  name: string;
  budget: number;
  status: string;
  brand: { name: string };
};

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function CampaignHeader({
  campaign,
  showBudget = true,
}: {
  campaign: Campaign;
  showBudget?: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form
        action={async (formData) => {
          await updateCampaign(campaign.id, formData);
          setEditing(false);
        }}
        className={`card p-4 grid ${showBudget ? "grid-cols-4" : "grid-cols-3"} gap-3 mb-6`}
      >
        <input className="input" name="name" defaultValue={campaign.name} required />
        {showBudget && (
          <input className="input" name="budget" type="number" min="0" defaultValue={campaign.budget} />
        )}
        <select className="input" name="status" defaultValue={campaign.status}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
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
    <div className="mb-6">
      <div className="text-xs text-muted mb-1">{campaign.brand.name}</div>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-xl font-display font-semibold">{campaign.name}</h1>
        <button className="text-xs text-muted hover:text-lift" onClick={() => setEditing(true)}>
          Edit
        </button>
      </div>
      <p className="text-sm text-muted">
        {showBudget ? `Budget ${money(campaign.budget)} · ` : ""}Status {campaign.status}
      </p>
    </div>
  );
}

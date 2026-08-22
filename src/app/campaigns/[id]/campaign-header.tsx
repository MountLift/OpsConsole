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

export default function CampaignHeader({
  campaign,
  showBudget = true,
  inlineEditOnly = false,
}: {
  campaign: Campaign;
  showBudget?: boolean;
  inlineEditOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);

  // inlineEditOnly = just show the Edit button/form, no heading (heading is rendered by parent)
  if (inlineEditOnly) {
    if (!editing) {
      return (
        <button className="text-xs text-muted hover:text-lift transition-colors" onClick={() => setEditing(true)}>
          Edit
        </button>
      );
    }
    return (
      <form
        action={async (formData) => {
          await updateCampaign(campaign.id, formData);
          setEditing(false);
        }}
        className={`card p-4 grid ${showBudget ? "grid-cols-4" : "grid-cols-3"} gap-3 mt-4`}
      >
        <input className="input" name="name" defaultValue={campaign.name} required />
        {showBudget && (
          <input className="input" name="budget" type="number" min="0" defaultValue={campaign.budget} />
        )}
        <select className="input" name="status" defaultValue={campaign.status}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex gap-2">
          <button className="btn" type="submit">Save</button>
          <button type="button" className="text-xs text-muted hover:text-amber" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  // Standalone header (legacy usage)
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
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex gap-2">
          <button className="btn" type="submit">Save</button>
          <button type="button" className="text-xs text-muted hover:text-amber" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </form>
    );
  }

  return (
    <div className="mb-6">
      <div className="text-xs text-muted mb-1">{campaign.brand.name}</div>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="text-xl font-display font-semibold">{campaign.name}</h1>
        <button className="text-xs text-muted hover:text-lift" onClick={() => setEditing(true)}>Edit</button>
      </div>
    </div>
  );
}

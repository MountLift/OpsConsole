"use client";

import { useState } from "react";
import DeleteButton from "@/components/delete-button";
import { updateCreator, deleteCreator } from "./actions";

type Creator = {
  id: string;
  name: string;
  handle: string | null;
  platform: string | null;
  email: string | null;
  _count: { deliverables: number };
};

export default function CreatorRow({ creator }: { creator: Creator }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form
        action={async (formData) => {
          await updateCreator(creator.id, formData);
          setEditing(false);
        }}
        className="grid grid-cols-5 gap-3 px-4 py-3"
      >
        <input className="input" name="name" defaultValue={creator.name} required />
        <input className="input" name="handle" defaultValue={creator.handle ?? ""} placeholder="@handle" />
        <input className="input" name="platform" defaultValue={creator.platform ?? ""} placeholder="Platform" />
        <input className="input" name="email" defaultValue={creator.email ?? ""} placeholder="Email" type="email" />
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
        <div className="font-medium">{creator.name}</div>
        <div className="text-muted text-xs">
          {creator.handle ?? "—"} · {creator.platform ?? "no platform set"} · {creator._count.deliverables} deliverables
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-xs text-muted hover:text-lift" onClick={() => setEditing(true)}>
          Edit
        </button>
        <DeleteButton
          onDelete={deleteCreator.bind(null, creator.id)}
          confirmMessage={`Remove ${creator.name}? This also removes their ${creator._count.deliverables} deliverable${creator._count.deliverables === 1 ? "" : "s"} and any payouts tied to them.`}
        />
      </div>
    </div>
  );
}

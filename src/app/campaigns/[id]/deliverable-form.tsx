"use client";

import { useRef, useTransition } from "react";
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

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await addDeliverable(campaignId, formData);
          formRef.current?.reset();
        });
      }}
      className={`card p-4 grid ${showRate ? "grid-cols-4" : "grid-cols-3"} gap-3 mb-6`}
    >
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
      <button className="btn" disabled={isPending}>
        {isPending ? "Adding…" : "Add deliverable"}
      </button>
    </form>
  );
}

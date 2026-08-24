"use client";

import { useRef, useTransition } from "react";
import { createCreator } from "./actions";

export default function CreatorForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(async () => {
          await createCreator(formData);
          formRef.current?.reset();
        });
      }}
      className="card p-4 mb-6"
    >
      <div className="text-xs text-muted mb-3">
        Fill only the fields you know. You can edit missing details later from the list below.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <label className="space-y-1">
          <span className="text-xs text-muted">Creator name *</span>
          <input className="input" name="name" placeholder="e.g. Aisha Khan" required />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted">Social handle</span>
          <input className="input" name="handle" placeholder="e.g. @aishacreates" />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted">Platform</span>
          <input className="input" name="platform" placeholder="e.g. Instagram" />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-muted">Email</span>
          <input className="input" name="email" placeholder="e.g. aisha@mail.com" type="email" />
        </label>
      </div>
      <div className="mt-4">
        <button className="btn" disabled={isPending}>
          {isPending ? "Adding…" : "Add creator"}
        </button>
      </div>
    </form>
  );
}

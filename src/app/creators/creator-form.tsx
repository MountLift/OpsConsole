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
      className="card p-4 grid grid-cols-5 gap-3 mb-6"
    >
      <input className="input" name="name" placeholder="Name" required />
      <input className="input" name="handle" placeholder="@handle" />
      <input className="input" name="platform" placeholder="Platform" />
      <input className="input" name="email" placeholder="Email" type="email" />
      <button className="btn" disabled={isPending}>
        {isPending ? "Adding…" : "Add creator"}
      </button>
    </form>
  );
}

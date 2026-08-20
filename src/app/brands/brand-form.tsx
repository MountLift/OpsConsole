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
      className="card p-4 grid grid-cols-4 gap-3 mb-6"
    >
      <input className="input" name="name" placeholder="Brand name" required />
      <input className="input" name="contactName" placeholder="Contact name" />
      <input className="input" name="contactEmail" placeholder="Contact email" type="email" />
      <button className="btn" disabled={isPending}>
        {isPending ? "Adding…" : "Add brand"}
      </button>
    </form>
  );
}

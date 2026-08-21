"use client";

import { useFormStatus } from "react-dom";

function RemoveSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="text-xs text-muted hover:text-amber" disabled={pending} type="submit">
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}

export default function DeleteButton({
  action,
  onDelete,
  confirmMessage,
}: {
  action?: (formData: FormData) => void | Promise<void>;
  onDelete?: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
}) {
  const act = action ?? onDelete;
  return (
    <form
      action={act}
      onSubmit={(e) => {
        e.stopPropagation();
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      <RemoveSubmitButton />
    </form>
  );
}

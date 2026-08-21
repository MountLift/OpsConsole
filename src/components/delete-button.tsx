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
  confirmMessage,
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage: string;
}) {
  return (
    <form
      action={action}
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

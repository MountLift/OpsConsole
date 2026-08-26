import { UserButton } from "@clerk/nextjs";

export default function PendingAccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="card p-8 max-w-sm text-center">
        <div className="font-display font-bold text-lg text-lift mb-2">MountLift</div>
        <h1 className="text-base font-medium mb-2">Access pending</h1>
        <p className="text-sm text-muted mb-6">
          Your account is signed in, but no role has been assigned yet. Ask an admin to set your
          role in MountLift&apos;s Team & Access page.
        </p>
        <div className="flex justify-center">
          <UserButton afterSignOutUrl="/sign-in" />
        </div>
      </div>
    </div>
  );
}

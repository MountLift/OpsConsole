import { prisma } from "@/lib/prisma";
import AuditPanel from "./audit-panel";
import { requireAccess } from "@/lib/require-access";

export default async function InsightsPage() {
  await requireAccess("/insights");

  const creators = await prisma.creator.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, handle: true, platform: true },
  });

  return (
    <div>
      <h1 className="text-xl font-display font-semibold mb-1">Insights</h1>
      <p className="text-sm text-muted mb-6">
        Instagram engagement audits — pick creators from your roster or paste handles directly.
      </p>

      <AuditPanel creators={creators} />
    </div>
  );
}

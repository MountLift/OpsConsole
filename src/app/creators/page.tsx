import { prisma } from "@/lib/prisma";
import CreatorForm from "./creator-form";
import CreatorRow from "./creator-row";
import { requireAccess } from "@/lib/require-access";

export default async function CreatorsPage() {
  await requireAccess("/creators");

  const creators = await prisma.creator.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { deliverables: true } } },
  });

  return (
    <div>
      <h1 className="text-xl font-display font-semibold mb-1">Creators</h1>
      <p className="text-sm text-muted mb-6">Your roster, across every platform.</p>

      <CreatorForm />

      <div className="card divide-y divide-line">
        {creators.length === 0 && <div className="p-4 text-sm text-muted">No creators yet — add one above.</div>}
        {creators.map((c) => (
          <CreatorRow key={c.id} creator={c} />
        ))}
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import CreatorForm from "./creator-form";
import DeleteButton from "@/components/delete-button";
import { deleteCreator } from "./actions";

export default async function CreatorsPage() {
  const creators = await prisma.creator.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { deliverables: true } } },
  });

  return (
    <div>
      <h1 className="text-xl font-medium mb-1">Creators</h1>
      <p className="text-sm text-muted mb-6">Your roster, across every platform.</p>

      <CreatorForm />

      <div className="card divide-y divide-line">
        {creators.length === 0 && <div className="p-4 text-sm text-muted">No creators yet — add one above.</div>}
        {creators.map((c) => (
          <div key={c.id} className="table-row flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-muted text-xs">
                {c.handle ?? "—"} · {c.platform ?? "no platform set"} · {c._count.deliverables} deliverables
              </div>
            </div>
            <DeleteButton
              onDelete={() => deleteCreator(c.id)}
              confirmMessage={`Remove ${c.name}? This also removes their ${c._count.deliverables} deliverable${c._count.deliverables === 1 ? "" : "s"} and any payouts tied to them.`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

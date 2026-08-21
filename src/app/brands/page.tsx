import { prisma } from "@/lib/prisma";
import BrandForm from "./brand-form";
import DeleteButton from "@/components/delete-button";
import { deleteBrand } from "./actions";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { campaigns: true } } },
  });

  return (
    <div>
      <h1 className="text-xl font-medium mb-1">Brands</h1>
      <p className="text-sm text-muted mb-6">Clients you run campaigns for.</p>

      <BrandForm />

      <div className="card divide-y divide-line">
        {brands.length === 0 && <div className="p-4 text-sm text-muted">No brands yet — add one above.</div>}
        {brands.map((b) => (
          <div key={b.id} className="table-row flex items-center justify-between px-4 py-3 text-sm">
            <div>
              <div className="font-medium">{b.name}</div>
              <div className="text-muted text-xs">
                {b.contactName ?? "no contact set"} · {b._count.campaigns} campaigns
              </div>
            </div>
            <DeleteButton
              action={deleteBrand.bind(null, b.id)}
              confirmMessage={`Remove ${b.name}? This also removes its ${b._count.campaigns} campaign${b._count.campaigns === 1 ? "" : "s"} and everything linked to them (deliverables, payouts, invoices).`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

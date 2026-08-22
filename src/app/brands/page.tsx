import { prisma } from "@/lib/prisma";
import BrandForm from "./brand-form";
import BrandRow from "./brand-row";
import { requireAccess } from "@/lib/require-access";

export default async function BrandsPage() {
  await requireAccess("/brands");

  const brands = await prisma.brand.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { campaigns: true } } },
  });

  return (
    <div>
      <h1 className="text-xl font-display font-semibold mb-1">Brands</h1>
      <p className="text-sm text-muted mb-6">Clients you run campaigns for.</p>

      <BrandForm />

      <div className="card divide-y divide-line">
        {brands.length === 0 && <div className="p-4 text-sm text-muted">No brands yet — add one above.</div>}
        {brands.map((b) => (
          <BrandRow key={b.id} brand={b} />
        ))}
      </div>
    </div>
  );
}

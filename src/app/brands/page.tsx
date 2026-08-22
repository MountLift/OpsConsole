import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BrandForm from "./brand-form";
import BrandRow from "./brand-row";
import { requireAccess } from "@/lib/require-access";

export default async function BrandsPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  await requireAccess("/brands");

  const query = searchParams?.q?.trim() ?? "";
  const whereClause: any = {};
  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { contactName: { contains: query, mode: "insensitive" } },
      { contactEmail: { contains: query, mode: "insensitive" } },
    ];
  }

  const [brands, totalBrands, totalCampaigns] = await Promise.all([
    prisma.brand.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { campaigns: true } } },
    }),
    prisma.brand.count(),
    prisma.campaign.count(),
  ]);

  const hasFilter = Boolean(query);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight mb-1">Brands</h1>
        <p className="text-sm text-muted">Client brand partnerships and linked campaigns.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted font-medium mb-1">Total Client Brands</div>
            <div className="text-2xl font-display font-semibold text-lift">{totalBrands}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-lift/10 border border-lift/20 text-lift">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted font-medium mb-1">Total Campaigns</div>
            <div className="text-2xl font-display font-semibold text-paper">{totalCampaigns}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-paper/10 border border-paper/20 text-paper">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-mono uppercase tracking-wider text-muted mb-3">Add New Brand</h2>
        <BrandForm />
      </div>

      <form method="GET" className="flex items-center gap-3">
        <div className="relative flex-1">
          <input name="q" defaultValue={query} placeholder="Search brand name, contact person, or email…" className="input pl-9" />
          <svg className="w-4 h-4 text-muted absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button type="submit" className="btn">Search</button>
        {hasFilter && <Link href="/brands" className="text-xs text-muted hover:text-amber">Clear</Link>}
      </form>

      <div className="card divide-y divide-line overflow-hidden">
        {brands.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted">
            {hasFilter ? "No brands match your search query." : "No brands yet — add one above."}
          </div>
        ) : (
          brands.map((b) => <BrandRow key={b.id} brand={b} />)
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CreatorForm from "./creator-form";
import CreatorRow from "./creator-row";
import { requireAccess } from "@/lib/require-access";

export default async function CreatorsPage({
  searchParams,
}: {
  searchParams?: { q?: string; platform?: string };
}) {
  await requireAccess("/creators");

  const query = searchParams?.q?.trim() ?? "";
  const platformFilter = searchParams?.platform?.trim() ?? "";

  const whereClause: any = {};
  if (query) {
    whereClause.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { handle: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
    ];
  }
  if (platformFilter) {
    whereClause.platform = { contains: platformFilter, mode: "insensitive" };
  }

  const [creators, totalCount, totalDeliverables] = await Promise.all([
    prisma.creator.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { deliverables: true } } },
    }),
    prisma.creator.count(),
    prisma.deliverable.count(),
  ]);

  const igCount = creators.filter(
    (c) => c.handle && (!c.platform || c.platform.toLowerCase().includes("insta"))
  ).length;

  const hasFilter = Boolean(query || platformFilter);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight mb-1">Creators</h1>
        <p className="text-sm text-muted">Manage your creator roster, handles, platforms, and deliverables.</p>
      </div>

      {/* Roster Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted font-medium mb-1">Total Roster</div>
            <div className="text-2xl font-display font-semibold text-paper">{totalCount}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-paper/10 border border-paper/20 text-paper">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted font-medium mb-1">Instagram Roster</div>
            <div className="text-2xl font-display font-semibold text-lift">{igCount}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-lift/10 border border-lift/20 text-lift">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          </div>
        </div>
        <div className="card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted font-medium mb-1">Total Deliverables</div>
            <div className="text-2xl font-display font-semibold text-amber">{totalDeliverables}</div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber/10 border border-amber/20 text-amber">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-mono uppercase tracking-wider text-muted mb-3">Add New Creator</h2>
        <p className="text-xs text-muted mb-3">
          Beginner tip: start with name and handle. You can edit platform and email later.
        </p>
        <CreatorForm />
      </div>

      <form method="GET" className="flex items-center gap-3">
        <div className="relative flex-1">
          <input name="q" defaultValue={query} placeholder="Search creator name, @handle, or email…" className="input pl-9" />
          <svg className="w-4 h-4 text-muted absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select name="platform" defaultValue={platformFilter} className="input w-48">
          <option value="">All Platforms</option>
          <option value="Instagram">Instagram</option>
          <option value="YouTube">YouTube</option>
          <option value="TikTok">TikTok</option>
        </select>
        <button type="submit" className="btn">Filter</button>
        {hasFilter && <Link href="/creators" className="text-xs text-muted hover:text-amber">Clear</Link>}
      </form>

      <div className="card divide-y divide-line overflow-hidden">
        {creators.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted">
            {hasFilter ? "No creators match your filter." : "No creators yet — add one above."}
          </div>
        ) : (
          creators.map((c) => <CreatorRow key={c.id} creator={c} />)
        )}
      </div>
    </div>
  );
}

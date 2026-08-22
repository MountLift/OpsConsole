import Link from "next/link";
import { prisma } from "@/lib/prisma";

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default async function DashboardPage() {
  const [
    activeCampaigns,
    allCampaignsCount,
    payoutsPending,
    invoicesOutstanding,
    activeCreatorsCount,
    pendingPayoutsList,
    recentCreators,
  ] = await Promise.all([
    prisma.campaign.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: { brand: true, _count: { select: { deliverables: true } } },
    }),
    prisma.campaign.count(),
    prisma.payout.aggregate({ _sum: { amount: true }, _count: true, where: { status: "PENDING" } }),
    prisma.invoice.aggregate({ _sum: { amount: true }, _count: true, where: { status: { in: ["SENT", "OVERDUE"] } } }),
    prisma.creator.count(),
    prisma.payout.findMany({
      where: { status: "PENDING" },
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { deliverable: { include: { creator: true, campaign: true } } },
    }),
    prisma.creator.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { deliverables: true } } },
    }),
  ]);

  const stats = [
    {
      label: "Active Campaigns",
      value: activeCampaigns.length,
      subtext: `${allCampaignsCount} total campaigns`,
      href: "/campaigns",
      color: "text-lift",
      bgColor: "bg-lift/10",
      borderColor: "border-lift/20",
      icon: (
        <svg className="w-5 h-5 text-lift" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: "Creators on Roster",
      value: activeCreatorsCount,
      subtext: "Across all platforms",
      href: "/creators",
      color: "text-paper",
      bgColor: "bg-paper/10",
      borderColor: "border-paper/20",
      icon: (
        <svg className="w-5 h-5 text-paper" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      label: "Payouts Pending",
      value: money(Number(payoutsPending._sum.amount ?? 0)),
      subtext: `${payoutsPending._count} payouts owed`,
      href: "/finance?status=OUTSTANDING",
      color: "text-amber",
      bgColor: "bg-amber/10",
      borderColor: "border-amber/20",
      icon: (
        <svg className="w-5 h-5 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Invoices Outstanding",
      value: money(Number(invoicesOutstanding._sum.amount ?? 0)),
      subtext: `${invoicesOutstanding._count} invoices pending`,
      href: "/finance?status=OUTSTANDING",
      color: "text-lift",
      bgColor: "bg-lift/10",
      borderColor: "border-lift/20",
      icon: (
        <svg className="w-5 h-5 text-lift" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Shortcuts */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-display font-bold tracking-tight">Dashboard</h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono bg-lift/10 text-lift border border-lift/20">
              <span className="w-1.5 h-1.5 rounded-full bg-lift animate-pulse" />
              Live Sync
            </span>
          </div>
          <p className="text-sm text-muted">Real-time ops summary across campaigns, creators, and finances.</p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-panel border border-line text-paper hover:border-lift hover:text-lift transition-colors"
          >
            <span>+ Campaign</span>
          </Link>
          <Link
            href="/creators"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-panel border border-line text-paper hover:border-lift hover:text-lift transition-colors"
          >
            <span>+ Creator</span>
          </Link>
          <Link
            href="/insights"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-lift text-ink font-semibold hover:opacity-90 transition-opacity"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>IG Audit</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="card p-5 group hover:border-lift/40 transition-all duration-200 hover:-translate-y-0.5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted font-medium">{s.label}</span>
              <div className={`p-2 rounded-lg ${s.bgColor} border ${s.borderColor}`}>
                {s.icon}
              </div>
            </div>
            <div className={`text-2xl font-display font-semibold mb-1 ${s.color}`}>
              {s.value}
            </div>
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{s.subtext}</span>
              <svg
                className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-lift"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Active Campaigns Interactive Overview */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-display font-semibold text-paper">Active Campaigns</h2>
            <p className="text-xs text-muted">Currently running brand partnerships & deliverables</p>
          </div>
          <Link href="/campaigns" className="text-xs text-lift hover:underline flex items-center gap-1 font-medium">
            <span>View all campaigns</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        <div className="divide-y divide-line border-t border-line -mx-5 -mb-5">
          {activeCampaigns.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted">
              No active campaigns right now.{" "}
              <Link href="/campaigns" className="text-lift hover:underline font-medium">
                Create one
              </Link>
            </div>
          ) : (
            activeCampaigns.map((c) => (
              <Link
                key={c.id}
                href={`/campaigns/${c.id}`}
                className="table-row flex items-center justify-between px-5 py-3.5 text-sm group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-lift animate-ping" />
                  <div>
                    <div className="font-medium text-paper group-hover:text-lift transition-colors">
                      {c.name}
                    </div>
                    <div className="text-xs text-muted flex items-center gap-2 mt-0.5">
                      <span>{c.brand.name}</span>
                      <span>•</span>
                      <span>{c._count.deliverables} deliverables</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-lift font-mono font-medium">{money(Number(c.budget))}</div>
                    <div className="text-[10px] text-muted uppercase tracking-wider font-mono">Budget</div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-lift/10 text-lift border border-lift/20">
                    ACTIVE
                  </span>

                  <svg
                    className="w-4 h-4 text-muted group-hover:text-lift group-hover:translate-x-1 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Split Activity Grid: Pending Payouts & Roster Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Payouts Overview */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-display font-semibold text-paper uppercase tracking-wide">
                  Pending Payouts
                </h3>
                <p className="text-xs text-muted">Awaiting creator settlement</p>
              </div>
              <Link href="/finance?status=OUTSTANDING" className="text-xs text-amber hover:underline font-medium">
                Finance tab →
              </Link>
            </div>

            <div className="divide-y divide-line border-t border-line -mx-5">
              {pendingPayoutsList.length === 0 ? (
                <div className="p-5 text-center text-xs text-muted">All creator payouts are settled!</div>
              ) : (
                pendingPayoutsList.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3 text-xs">
                    <div>
                      <div className="font-medium text-paper">{p.deliverable.creator.name}</div>
                      <div className="text-muted text-[11px] mt-0.5">{p.deliverable.campaign.name}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-amber font-medium">{money(Number(p.amount))}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber/10 text-amber border border-amber/20">
                        PENDING
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Roster Additions */}
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-display font-semibold text-paper uppercase tracking-wide">
                  Creators Roster
                </h3>
                <p className="text-xs text-muted">Recent creator profiles</p>
              </div>
              <Link href="/creators" className="text-xs text-lift hover:underline font-medium">
                All creators →
              </Link>
            </div>

            <div className="divide-y divide-line border-t border-line -mx-5">
              {recentCreators.length === 0 ? (
                <div className="p-5 text-center text-xs text-muted">No creators added yet.</div>
              ) : (
                recentCreators.map((cr) => (
                  <div key={cr.id} className="flex items-center justify-between px-5 py-3 text-xs">
                    <div>
                      <div className="font-medium text-paper">{cr.name}</div>
                      <div className="text-muted text-[11px] mt-0.5">
                        {cr.handle ? `@${cr.handle.replace(/^@/, "")}` : "No handle"} {cr.platform ? `• ${cr.platform}` : ""}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-panel text-muted border border-line">
                      {cr._count.deliverables} deliverables
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

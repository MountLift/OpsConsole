import Link from "next/link";
import {
  TrendingUp,
  Sparkles,
  CircleDollarSign,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  ArrowRight,
  FileSpreadsheet,
  BarChart3,
  Layers,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

function money(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminDashboard() {
  const [
    activeCampaigns,
    allCampaignsCount,
    brandCount,
    creatorCount,
    pendingPayouts,
    outstandingInvoices,
    recentPendingPayouts,
    recentCreators,
  ] = await Promise.all([
    prisma.campaign.findMany({
      where: { status: "ACTIVE" },
      include: { brand: true, _count: { select: { deliverables: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.campaign.count(),
    prisma.brand.count(),
    prisma.creator.count(),
    prisma.payout.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { status: "PENDING" },
    }),
    prisma.invoice.aggregate({
      _sum: { amount: true },
      _count: true,
      where: { status: { in: ["SENT", "OVERDUE"] } },
    }),
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

  const pendingPayoutAmount = Number(pendingPayouts._sum.amount ?? 0);
  const outstandingInvoiceAmount = Number(outstandingInvoices._sum.amount ?? 0);
  const totalActiveBudget = activeCampaigns.reduce((sum, c) => sum + Number(c.budget), 0);

  const stats = [
    {
      label: "Active Campaigns",
      value: activeCampaigns.length,
      detail: `${allCampaignsCount} total campaigns across ${brandCount} brands`,
      href: "/campaigns",
      color: "text-lift",
      bgColor: "bg-lift/10",
      borderColor: "border-lift/20",
      icon: TrendingUp,
    },
    {
      label: "Creators Roster",
      value: creatorCount,
      detail: "Active talent across platforms",
      href: "/creators",
      color: "text-paper",
      bgColor: "bg-paper/10",
      borderColor: "border-paper/20",
      icon: Sparkles,
    },
    {
      label: "Pending Payouts",
      value: money(pendingPayoutAmount),
      detail: `${pendingPayouts._count} creator payouts to clear`,
      href: "/finance?status=outstanding",
      color: "text-amber",
      bgColor: "bg-amber/10",
      borderColor: "border-amber/20",
      icon: CircleDollarSign,
    },
    {
      label: "Outstanding Invoices",
      value: money(outstandingInvoiceAmount),
      detail: `${outstandingInvoices._count} client invoices pending`,
      href: "/finance?status=outstanding",
      color: "text-lift",
      bgColor: "bg-lift/10",
      borderColor: "border-lift/20",
      icon: AlertTriangle,
    },
  ];

  const systemFlow = [
    { step: "1", title: "Roster Creators", desc: "Add talent profiles & handles", href: "/creators" },
    { step: "2", title: "Add Brands", desc: "Manage client brand accounts", href: "/brands" },
    { step: "3", title: "Launch Campaigns", desc: "Set budget & assign deliverables", href: "/campaigns" },
    { step: "4", title: "Settle Finance", desc: "Track payables & brand invoices", href: "/finance" },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Shortcuts */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-display font-bold tracking-tight">Admin Console</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-lift/10 text-lift border border-lift/20">
              <span className="w-1.5 h-1.5 rounded-full bg-lift animate-pulse" />
              Full System Access
            </span>
          </div>
          <p className="text-sm text-muted">Complete operational oversight across campaigns, roster, and finances.</p>
        </div>

        {/* Quick Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-panel border border-line text-paper hover:border-lift hover:text-lift transition-colors"
          >
            <Plus size={14} />
            <span>Campaign</span>
          </Link>
          <Link
            href="/creators"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-panel border border-line text-paper hover:border-lift hover:text-lift transition-colors"
          >
            <Plus size={14} />
            <span>Creator</span>
          </Link>
          <Link
            href="/api/export/finance"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-panel border border-line text-paper hover:border-lift hover:text-lift transition-colors"
            download
          >
            <FileSpreadsheet size={14} />
            <span>Export CSV</span>
          </Link>
          <Link
            href="/insights"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-lift text-ink hover:opacity-90 transition-opacity"
          >
            <BarChart3 size={14} />
            <span>IG Audit</span>
          </Link>
        </div>
      </div>

      {/* System Operational Guide Banner for New Admins */}
      <div className="card p-5 bg-gradient-to-r from-panel via-ink to-panel border-line">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-lift" />
            <h2 className="text-sm font-display font-semibold text-paper">How MountLift Ops Works</h2>
          </div>
          <span className="text-[11px] font-mono text-muted">Operational Workflow</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {systemFlow.map((s) => (
            <Link
              key={s.step}
              href={s.href}
              className="p-3 rounded-lg bg-ink/70 border border-line hover:border-lift/40 transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="w-5 h-5 rounded-full bg-lift/10 border border-lift/20 text-lift font-mono text-xs flex items-center justify-center font-bold">
                  {s.step}
                </span>
                <ArrowRight size={12} className="text-muted group-hover:text-lift group-hover:translate-x-0.5 transition-all" />
              </div>
              <div className="text-xs font-medium text-paper group-hover:text-lift transition-colors">{s.title}</div>
              <div className="text-[11px] text-muted mt-0.5">{s.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Hero Stats Grid */}
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
                <s.icon size={18} className={s.color} />
              </div>
            </div>
            <div className={`text-2xl font-display font-semibold mb-1 ${s.color}`}>{s.value}</div>
            <div className="flex items-center justify-between text-xs text-muted">
              <span>{s.detail}</span>
              <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-lift" />
            </div>
          </Link>
        ))}
      </div>

      {/* Main 2-Column Operational Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Active Campaigns Overview */}
        <div className="lg:col-span-2 card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-display font-semibold text-paper">Active Campaigns Overview</h2>
                <p className="text-xs text-muted">Live brand partnerships and budget commitments</p>
              </div>
              <Link href="/campaigns" className="text-xs text-lift hover:underline flex items-center gap-1 font-medium">
                <span>All campaigns ({allCampaignsCount})</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="divide-y divide-line border-t border-line -mx-5">
              {activeCampaigns.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted">
                  No active campaigns.{" "}
                  <Link href="/campaigns" className="text-lift hover:underline font-medium">
                    Create one
                  </Link>
                </div>
              ) : (
                activeCampaigns.slice(0, 5).map((c) => (
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
                        <div className="text-xs text-muted flex items-center gap-2 mt-0.5 font-mono">
                          <span>{c.brand.name}</span>
                          <span>•</span>
                          <span>{c._count.deliverables} deliverables</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono">
                        <div className="text-lift font-medium">{money(Number(c.budget))}</div>
                        <div className="text-[10px] text-muted uppercase">Budget</div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-lift/10 text-lift border border-lift/20">
                        ACTIVE
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs text-muted font-mono">
            <span>Total Active Budget: {money(totalActiveBudget)}</span>
            <Link href="/campaigns" className="hover:text-lift">View detailed ledger →</Link>
          </div>
        </div>

        {/* Right 1 Column: Pending Payouts & Action Items */}
        <div className="card p-5 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-display font-semibold text-paper uppercase tracking-wide">
                  Pending Payouts
                </h3>
                <p className="text-xs text-muted">Payables waiting settlement</p>
              </div>
              <Link href="/finance?status=outstanding" className="text-xs text-amber hover:underline font-medium">
                Finance →
              </Link>
            </div>

            <div className="divide-y divide-line border-t border-line -mx-5">
              {recentPendingPayouts.length === 0 ? (
                <div className="p-5 text-center text-xs text-muted">All creator payouts are settled!</div>
              ) : (
                recentPendingPayouts.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3 text-xs">
                    <div>
                      <div className="font-medium text-paper">{p.deliverable.creator.name}</div>
                      <div className="text-muted text-[11px] mt-0.5">{p.deliverable.campaign.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
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

          {/* Roster Additions Quick View */}
          <div className="pt-4 border-t border-line">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-muted">Recent Creators</span>
              <Link href="/creators" className="text-xs text-lift hover:underline">
                Roster ({creatorCount})
              </Link>
            </div>
            <div className="space-y-2">
              {recentCreators.slice(0, 3).map((cr) => (
                <div key={cr.id} className="flex items-center justify-between text-xs p-2 rounded bg-ink border border-line">
                  <span className="font-medium text-paper">{cr.name}</span>
                  <span className="text-muted font-mono">{cr.handle ? `@${cr.handle.replace(/^@/, "")}` : "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

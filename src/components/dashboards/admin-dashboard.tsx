import Link from "next/link";
import { AlertTriangle, CalendarClock, CheckCircle2, CircleDollarSign, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";

function money(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function daysUntil(date: Date | null) {
  if (!date) return Number.POSITIVE_INFINITY;
  const diffInMs = new Date(date).getTime() - Date.now();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}

export default async function AdminDashboard() {
  const [
    activeCampaigns,
    brandCount,
    creatorCount,
    pendingPayouts,
    pendingPayoutCount,
    outstandingInvoices,
    overdueInvoices,
    submittedApprovals,
    deliverables,
    recentCampaigns,
  ] = await Promise.all([
    prisma.campaign.findMany({
      where: { status: "ACTIVE" },
      include: { brand: true },
    }),
    prisma.brand.count(),
    prisma.creator.count(),
    prisma.payout.aggregate({
      _sum: { amount: true },
      where: { status: "PENDING" },
    }),
    prisma.payout.count({ where: { status: "PENDING" } }),
    prisma.invoice.aggregate({
      _sum: { amount: true },
      where: { status: { in: ["SENT", "OVERDUE"] } },
    }),
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
    prisma.deliverable.count({ where: { status: "SUBMITTED" } }),
    prisma.deliverable.findMany({
      where: { dueDate: { not: null } },
      include: { creator: true, campaign: true },
      orderBy: { dueDate: "asc" },
      take: 12,
    }),
    prisma.campaign.findMany({
      include: { brand: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalActiveBudget = activeCampaigns.reduce((sum, campaign) => sum + Number(campaign.budget), 0);
  const pendingPayoutAmount = Number(pendingPayouts._sum.amount ?? 0);
  const outstandingInvoiceAmount = Number(outstandingInvoices._sum.amount ?? 0);
  const dueThisWeek = deliverables.filter(
    (deliverable) => deliverable.dueDate && daysUntil(deliverable.dueDate) <= 7 && daysUntil(deliverable.dueDate) >= 0
  );

  const primaryStats = [
    { label: "Active campaigns", value: activeCampaigns.length, note: `${brandCount} brands`, icon: TrendingUp },
    { label: "Creators", value: creatorCount, note: "On roster", icon: CheckCircle2 },
    { label: "Pending payouts", value: money(pendingPayoutAmount), note: `${pendingPayoutCount} requests`, icon: CircleDollarSign },
    { label: "Outstanding invoices", value: money(outstandingInvoiceAmount), note: `${overdueInvoices} overdue`, icon: AlertTriangle },
  ];

  const actionItems = [
    {
      title: "Approvals waiting",
      detail: `${submittedApprovals} deliverables need review`,
    },
    {
      title: "Payout queue",
      detail: `${pendingPayoutCount} pending payout request${pendingPayoutCount === 1 ? "" : "s"}`,
    },
    {
      title: "Due this week",
      detail: `${dueThisWeek.length} deliverables due in 7 days`,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-semibold mb-1">Operations dashboard</h1>
        <p className="text-sm text-muted">Simple overview of what needs attention today.</p>
      </div>

      <div className="card p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-muted">Active budget</div>
        <div className="text-2xl font-medium text-lift mt-2">{money(totalActiveBudget)}</div>
        <div className="text-[11px] text-muted mt-1">Across all active campaigns</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {primaryStats.map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="text-xs text-muted">{stat.label}</div>
              <stat.icon size={16} className="text-lift" />
            </div>
            <div className="text-2xl font-medium text-lift">{stat.value}</div>
            <div className="text-[11px] text-muted mt-1">{stat.note}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-muted">Priority actions</div>
          <div className="text-lg font-medium text-lift mt-1 mb-4">What to handle now</div>
          <div className="space-y-2">
            {actionItems.map((item) => (
              <div key={item.title} className="rounded-md border border-line bg-ink px-3 py-3">
                <div className="flex items-center gap-2 text-sm font-medium text-lift">
                  <CheckCircle2 size={14} />
                  {item.title}
                </div>
                <div className="text-xs text-muted mt-1">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted">Checkpoints</div>
              <div className="text-lg font-medium text-lift mt-1">Due this week</div>
            </div>
            <CalendarClock size={16} className="text-lift" />
          </div>
          <div className="space-y-2">
            {dueThisWeek.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-md border border-line bg-ink px-3 py-2">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{item.creator.name}</div>
                    <div className="text-[11px] text-muted">{item.campaign.name} · {item.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-muted">Due</div>
                    <div className="text-xs font-mono text-lift">
                      {new Date(item.dueDate ?? Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {dueThisWeek.length === 0 && (
              <div className="text-sm text-muted">No deliverables due this week.</div>
            )}
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted">Recent activity</div>
            <div className="text-lg font-medium text-lift mt-1">Latest campaigns</div>
          </div>
          <Link href="/campaigns" className="text-xs text-lift hover:text-yellow-300">
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {recentCampaigns.length === 0 && <div className="text-sm text-muted">No campaigns yet.</div>}
          {recentCampaigns.map((campaign) => (
            <div key={campaign.id} className="table-row flex items-center justify-between rounded-md border border-line bg-ink px-3 py-2">
              <div>
                <div className="text-sm font-medium">{campaign.name}</div>
                <div className="text-xs text-muted">{campaign.brand.name}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono text-lift">{campaign.status}</div>
                <div className="text-[11px] text-muted">{money(Number(campaign.budget))}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

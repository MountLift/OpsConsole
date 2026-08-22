import Link from "next/link";
import { AlertTriangle, ArrowUpRight, CalendarClock, CheckCircle2, CircleDollarSign, Sparkles, TrendingUp } from "lucide-react";
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
  const [campaigns, brandCount, creatorCount, pendingPayouts, outstandingInvoices, deliverables, recentCampaigns] =
    await Promise.all([
      prisma.campaign.findMany({
        where: { status: "ACTIVE" },
        include: { brand: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.brand.count(),
      prisma.creator.count(),
      prisma.payout.aggregate({
        _sum: { amount: true },
        where: { status: "PENDING" },
      }),
      prisma.invoice.aggregate({
        _sum: { amount: true },
        where: { status: { in: ["SENT", "OVERDUE"] } },
      }),
      prisma.deliverable.findMany({
        include: { creator: true, campaign: { include: { brand: true } } },
        orderBy: { dueDate: "asc" },
      }),
      prisma.campaign.findMany({
        include: { brand: true },
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
    ]);

  const [pendingPayoutCount, overdueInvoices] = await Promise.all([
    prisma.payout.count({ where: { status: "PENDING" } }),
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
  ]);

  const pendingPayoutAmount = Number(pendingPayouts._sum.amount ?? 0);
  const outstandingInvoiceAmount = Number(outstandingInvoices._sum.amount ?? 0);
  const totalActiveBudget = campaigns.reduce((sum, campaign) => sum + Number(campaign.budget), 0);
  const onTrackDeliverables = deliverables.filter(
    (deliverable) => deliverable.status === "APPROVED" || deliverable.status === "LIVE"
  ).length;
  const deliverableCoverage = deliverables.length === 0 ? 0 : Math.round((onTrackDeliverables / deliverables.length) * 100);
  const upcomingDeliverables = deliverables.filter(
    (deliverable) => deliverable.dueDate && daysUntil(deliverable.dueDate) <= 7 && daysUntil(deliverable.dueDate) >= 0
  );

  const stats = [
    { label: "Active campaigns", value: campaigns.length, detail: `${brandCount} brands`, icon: TrendingUp },
    { label: "Creators on roster", value: creatorCount, detail: "Across all roles", icon: Sparkles },
    { label: "Payouts pending", value: money(pendingPayoutAmount), detail: `${pendingPayoutCount} requests`, icon: CircleDollarSign },
    { label: "Invoices outstanding", value: money(outstandingInvoiceAmount), detail: `${overdueInvoices} overdue`, icon: AlertTriangle },
  ];

  const priorityActions = [
    {
      title: "Review approvals",
      meta: `${Math.max(0, deliverables.filter((item) => item.status === "SUBMITTED").length)} deliverables waiting for sign-off`,
      tone: "amber",
    },
    {
      title: "Payout queue",
      meta: `${pendingPayoutAmount > 0 ? money(pendingPayoutAmount) : "No pending"} waiting to clear`,
      tone: "gold",
    },
    {
      title: "Due this week",
      meta: `${upcomingDeliverables.length} creator checks due in the next 7 days`,
      tone: "blue",
    },
  ];

  const aiSummary = `AI summary: ${Math.max(0, deliverables.filter((item) => item.status === "SUBMITTED").length)} approvals are waiting, ${overdueInvoices} invoices are overdue, and ${upcomingDeliverables.length} creative checkpoints need attention before the week closes.`;

  const roleWidgets = [
    { label: "Budget momentum", value: money(totalActiveBudget), hint: "Current active spend" },
    { label: "Approval risk", value: `${deliverableCoverage}%`, hint: "On-track deliverables" },
    { label: "Queue health", value: `${pendingPayoutCount}`, hint: "Pending payout requests" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-semibold mb-1">Operations dashboard</h1>
          <p className="text-sm text-muted">Snapshot across every active campaign and creator workflow.</p>
        </div>
        <div className="card px-3 py-2 text-xs text-muted font-mono uppercase tracking-[0.18em]">
          Live overview
        </div>
      </div>

      <div className="card border-lift/40 bg-gradient-to-r from-lift/10 via-ink to-panel p-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-lift mb-2">AI summary</div>
        <div className="text-sm text-paper">{aiSummary}</div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {roleWidgets.map((widget) => (
          <div key={widget.label} className="card p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted">{widget.label}</div>
            <div className="text-2xl font-medium text-lift mt-2">{widget.value}</div>
            <div className="text-[11px] text-muted mt-1">{widget.hint}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs text-muted">{stat.label}</div>
              <stat.icon size={16} className="text-lift" />
            </div>
            <div className="text-2xl font-medium text-lift">{stat.value}</div>
            <div className="text-[11px] text-muted mt-2">{stat.detail}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1.5fr_0.9fr] gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted">Ops pulse</div>
              <div className="text-lg font-medium text-lift mt-1">Campaign momentum</div>
            </div>
            <div className="flex items-center gap-1 text-xs font-mono text-emerald-300">
              <ArrowUpRight size={14} />
              +12.4% this month
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-5">
            <div className="rounded-md border border-line bg-ink px-3 py-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Budget</div>
              <div className="text-xl font-medium text-lift mt-2">{money(totalActiveBudget)}</div>
            </div>
            <div className="rounded-md border border-line bg-ink px-3 py-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Deliverable health</div>
              <div className="text-xl font-medium text-lift mt-2">{deliverableCoverage}%</div>
            </div>
            <div className="rounded-md border border-line bg-ink px-3 py-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Due this week</div>
              <div className="text-xl font-medium text-lift mt-2">{upcomingDeliverables.length}</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2 text-xs text-muted">
                <span>Deliverable approvals</span>
                <span>{deliverableCoverage}%</span>
              </div>
              <div className="h-2 rounded-full bg-ink overflow-hidden border border-line">
                <div className="h-full rounded-full bg-lift" style={{ width: `${deliverableCoverage}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2 text-xs text-muted">
                <span>Budget coverage</span>
                <span>{Math.min(100, Math.round((totalActiveBudget / Math.max(1, outstandingInvoiceAmount + totalActiveBudget)) * 100))}%</span>
              </div>
              <div className="h-2 rounded-full bg-ink overflow-hidden border border-line">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(100, Math.round((totalActiveBudget / Math.max(1, outstandingInvoiceAmount + totalActiveBudget)) * 100))}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs uppercase tracking-[0.18em] text-muted">Priority actions</div>
            <CheckCircle2 size={15} className="text-lift" />
          </div>
          <div className="space-y-3">
            {priorityActions.map((item) => (
              <div key={item.title} className="rounded-md border border-line bg-ink p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-lift">{item.title}</div>
                  <span className={`h-2.5 w-2.5 rounded-full ${item.tone === "amber" ? "bg-amber-400" : item.tone === "gold" ? "bg-yellow-300" : "bg-sky-400"}`} />
                </div>
                <div className="text-xs text-muted">{item.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted">Recent activity</div>
              <div className="text-lg font-medium text-lift mt-1">Latest campaigns</div>
            </div>
            <Link href="/campaigns" className="text-xs text-lift hover:text-yellow-300">View all</Link>
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

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted">Checkpoints</div>
              <div className="text-lg font-medium text-lift mt-1">Upcoming deliverables</div>
            </div>
            <CalendarClock size={16} className="text-lift" />
          </div>
          <div className="space-y-2">
            {deliverables.filter((item) => item.dueDate).slice(0, 5).map((item) => (
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
            {deliverables.filter((item) => item.dueDate).length === 0 && (
              <div className="text-sm text-muted">No deliverables scheduled yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
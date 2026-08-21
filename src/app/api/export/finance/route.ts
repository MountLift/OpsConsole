import { prisma } from "@/lib/prisma";

export async function GET() {
  const [payouts, invoices] = await Promise.all([
    prisma.payout.findMany({
      orderBy: { createdAt: "desc" },
      include: { deliverable: { include: { creator: true, campaign: true } } },
    }),
    prisma.invoice.findMany({
      orderBy: { issuedAt: "desc" },
      include: { brand: true, campaign: true },
    }),
  ]);

  const rows = [
    ["Type", "Entity/Name", "Campaign", "Amount", "Status", "Date"],
    ...payouts.map((p) => [
      "Payout",
      `"${p.deliverable.creator.name.replace(/"/g, '""')}"`,
      `"${p.deliverable.campaign.name.replace(/"/g, '""')}"`,
      Number(p.amount).toFixed(2),
      p.status,
      p.createdAt.toISOString().split("T")[0],
    ]),
    ...invoices.map((i) => [
      "Invoice",
      `"${i.brand.name.replace(/"/g, '""')}"`,
      `"${(i.campaign?.name ?? "—").replace(/"/g, '""')}"`,
      Number(i.amount).toFixed(2),
      i.status,
      i.issuedAt.toISOString().split("T")[0],
    ]),
  ];

  const csv = rows.map((r) => r.join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="finance-export.csv"',
    },
  });
}

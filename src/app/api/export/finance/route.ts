import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { getRole } from "@/lib/get-role";

export async function GET(request: Request) {
  const [session, role] = await Promise.all([auth(), getRole()]);
  if (!session.userId || role !== "ADMIN") {
    return new Response("Forbidden", { status: 403 });
  }
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const statusFilter = searchParams.get("status")?.trim() ?? "";

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

  const filteredPayouts = payouts.filter((p) => {
    const matchesQuery = query
      ? p.deliverable.creator.name.toLowerCase().includes(query.toLowerCase()) ||
        p.deliverable.campaign.name.toLowerCase().includes(query.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "OUTSTANDING"
        ? p.status !== "PAID"
        : statusFilter === "PAID"
        ? p.status === "PAID"
        : true;

    return matchesQuery && matchesStatus;
  });

  const filteredInvoices = invoices.filter((i) => {
    const matchesQuery = query
      ? i.brand.name.toLowerCase().includes(query.toLowerCase()) ||
        (i.campaign?.name ?? "").toLowerCase().includes(query.toLowerCase())
      : true;

    const matchesStatus =
      statusFilter === "OUTSTANDING"
        ? i.status !== "PAID"
        : statusFilter === "PAID"
        ? i.status === "PAID"
        : true;

    return matchesQuery && matchesStatus;
  });

  const rows = [
    ["Type", "Entity/Name", "Campaign", "Amount", "Status", "Date"],
    ...filteredPayouts.map((p) => [
      "Payout",
      `"${p.deliverable.creator.name.replace(/"/g, '""')}"`,
      `"${p.deliverable.campaign.name.replace(/"/g, '""')}"`,
      Number(p.amount).toFixed(2),
      p.status,
      p.createdAt.toISOString().split("T")[0],
    ]),
    ...filteredInvoices.map((i) => [
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

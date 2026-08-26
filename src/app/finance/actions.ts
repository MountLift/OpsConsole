"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/access";

function amount(formData: FormData) {
  const value = Number(formData.get("amount"));
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export async function createPayout(deliverableId: string, campaignId: string, formData: FormData) {
  await requireAdmin();
  const value = amount(formData);
  if (value === null) return;
  const deliverable = await prisma.deliverable.findFirst({ where: { id: deliverableId, campaignId }, select: { id: true } });
  if (!deliverable) return;
  await prisma.payout.create({ data: { deliverableId, amount: value } });
  revalidatePath(`/campaigns/${campaignId}`); revalidatePath("/campaigns"); revalidatePath("/finance"); revalidatePath("/");
}

export async function createInvoice(brandId: string, campaignId: string, formData: FormData) {
  await requireAdmin();
  const value = amount(formData);
  if (value === null) return;
  const campaign = await prisma.campaign.findFirst({ where: { id: campaignId, brandId }, select: { id: true } });
  if (!campaign) return;
  await prisma.invoice.create({ data: { brandId, campaignId, amount: value, status: "DRAFT" } });
  revalidatePath(`/campaigns/${campaignId}`); revalidatePath("/campaigns"); revalidatePath("/finance"); revalidatePath("/");
}

export async function updatePayout(id: string, formData: FormData) {
  await requireAdmin();
  const value = amount(formData); if (value === null) return;
  const status = String(formData.get("status"));
  if (!['PENDING', 'APPROVED', 'PAID'].includes(status)) return;
  await prisma.payout.update({ where: { id }, data: { amount: value, status: status as any, paidAt: status === "PAID" ? new Date() : null } });
  revalidatePath("/finance"); revalidatePath("/campaigns"); revalidatePath("/");
}

export async function updateInvoice(id: string, formData: FormData) {
  await requireAdmin();
  const value = amount(formData); if (value === null) return;
  const status = String(formData.get("status"));
  if (!['DRAFT', 'SENT', 'PAID', 'OVERDUE'].includes(status)) return;
  await prisma.invoice.update({ where: { id }, data: { amount: value, status: status as any, paidAt: status === "PAID" ? new Date() : null } });
  revalidatePath("/finance"); revalidatePath("/campaigns"); revalidatePath("/");
}

export async function markPayoutPaid(id: string) {
  await requireAdmin();
  await prisma.payout.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date() },
  });
  revalidatePath("/finance");
}

export async function markInvoicePaid(id: string) {
  await requireAdmin();
  await prisma.invoice.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date() },
  });
  revalidatePath("/finance");
}

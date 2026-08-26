"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireContext, campaignScope } from "@/lib/access";

export async function createCampaign(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const brandId = String(formData.get("brandId") ?? "");
  if (!name || !brandId) return;

  await prisma.campaign.create({
    data: {
      name,
      brandId,
      budget: Number(formData.get("budget") ?? 0),
    },
  });

  revalidatePath("/campaigns");
}

export async function addDeliverable(campaignId: string, formData: FormData) {
  await requireAdmin();
  const creatorId = String(formData.get("creatorId") ?? "");
  if (!creatorId) return;

  await prisma.deliverable.create({
    data: {
      campaignId,
      creatorId,
      type: String(formData.get("type") ?? "POST") as any,
      agreedRate: Number(formData.get("agreedRate") ?? 0),
    },
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

export async function updateCampaign(id: string, formData: FormData) {
  const context = await requireContext();
  if (context.role === "CREATOR_MANAGER") return;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const data: { name: string; status: any; budget?: number } = {
    name,
    status: String(formData.get("status") ?? "PLANNING") as any,
  };

  // Only touch budget if the field was actually present — Account Managers'
  // edit form omits it entirely, and we don't want that to zero it out.
  if (formData.has("budget")) {
    data.budget = Number(formData.get("budget") ?? 0);
  }

  const campaign = await prisma.campaign.findFirst({ where: { id, ...campaignScope(context) }, select: { id: true } });
  if (!campaign) return;
  await prisma.campaign.update({ where: { id }, data });

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${id}`);
}

export async function deleteCampaign(id: string) {
  await requireAdmin();
  await prisma.campaign.delete({ where: { id } });
  revalidatePath("/campaigns");
  revalidatePath("/finance");
  revalidatePath("/");
}

export async function deleteDeliverable(id: string, campaignId: string) {
  await requireAdmin();
  await prisma.deliverable.delete({ where: { id } });
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/finance");
}

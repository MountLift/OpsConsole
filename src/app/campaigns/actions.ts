"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCampaign(formData: FormData) {
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

export async function deleteCampaign(id: string) {
  await prisma.campaign.delete({ where: { id } });
  revalidatePath("/campaigns");
  revalidatePath("/finance");
  revalidatePath("/");
}

export async function deleteDeliverable(id: string, campaignId: string) {
  await prisma.deliverable.delete({ where: { id } });
  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/finance");
}

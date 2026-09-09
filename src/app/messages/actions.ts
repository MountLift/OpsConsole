"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { campaignScope, requireContext } from "@/lib/access";

export async function sendCampaignMessage(campaignId: string, formData: FormData) {
  const context = await requireContext();
  const body = String(formData.get("body") ?? "").trim();
  if (!body || body.length > 2000) return;

  const campaign = await prisma.campaign.findFirst({
    where: { id: campaignId, ...campaignScope(context) },
    select: { id: true },
  });
  if (!campaign) return;

  await prisma.campaignMessage.create({
    data: { campaignId: campaign.id, senderClerkId: context.clerkUserId, body },
  });

  revalidatePath("/messages");
  revalidatePath(`/campaigns/${campaignId}`);
}
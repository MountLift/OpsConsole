"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createBrand(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.brand.create({
    data: {
      name,
      contactName: String(formData.get("contactName") ?? "") || null,
      contactEmail: String(formData.get("contactEmail") ?? "") || null,
    },
  });

  revalidatePath("/brands");
}

export async function deleteBrand(id: string) {
  await prisma.payout.deleteMany({
    where: { deliverable: { campaign: { brandId: id } } },
  });
  await prisma.deliverable.deleteMany({
    where: { campaign: { brandId: id } },
  });
  await prisma.invoice.deleteMany({
    where: { brandId: id },
  });
  await prisma.campaign.deleteMany({
    where: { brandId: id },
  });
  await prisma.brand.delete({ where: { id } });
  revalidatePath("/brands");
  revalidatePath("/campaigns");
  revalidatePath("/finance");
  revalidatePath("/");
}

export async function updateBrand(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.brand.update({
    where: { id },
    data: {
      name,
      contactName: String(formData.get("contactName") ?? "") || null,
      contactEmail: String(formData.get("contactEmail") ?? "") || null,
    },
  });

  revalidatePath("/brands");
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCreator(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  await prisma.creator.create({
    data: {
      name,
      handle: String(formData.get("handle") ?? "") || null,
      platform: String(formData.get("platform") ?? "") || null,
      email: String(formData.get("email") ?? "") || null,
      rateCard: String(formData.get("rateCard") ?? "") || null,
    },
  });

  revalidatePath("/creators");
}

export async function deleteCreator(id: string) {
  await prisma.creator.delete({ where: { id } });
  revalidatePath("/creators");
  revalidatePath("/campaigns");
  revalidatePath("/finance");
  revalidatePath("/");
}

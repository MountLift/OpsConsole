"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markPayoutPaid(id: string) {
  await prisma.payout.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date() },
  });
  revalidatePath("/finance");
}

export async function markInvoicePaid(id: string) {
  await prisma.invoice.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date() },
  });
  revalidatePath("/finance");
}

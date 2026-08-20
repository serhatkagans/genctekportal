import { prisma } from "@/lib/db";

export async function erisimLogla(girdi: {
  kullaniciId: string;
  islem: string;
  hedefTip: string;
  hedefId: string;
  detay: string;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: girdi.kullaniciId,
      action: girdi.islem,
      targetType: girdi.hedefTip,
      targetId: girdi.hedefId,
      metadata: { detay: girdi.detay },
    },
  });
}

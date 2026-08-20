import { z } from "zod";

const phone = z.string().trim().regex(/^\+90\s?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/, "Telefon +90 5xx xxx xx xx biçiminde olmalıdır.");

export const participationSchema = z.object({
  applicantType: z.enum(["STUDENT", "TEACHER"]),
  studentName: z.string().trim().max(120).optional().or(z.literal("")),
  studentPhone: z.string().trim().optional().or(z.literal("")),
  studentEmail: z.string().trim().optional().or(z.literal("")),
  teacherName: z.string().trim().max(120).optional().or(z.literal("")),
  teacherPhone: z.string().trim().optional().or(z.literal("")),
  teacherEmail: z.string().trim().optional().or(z.literal("")),
  institution: z.string().trim().min(2, "Okul veya kurum zorunludur.").max(180),
  province: z.string().trim().min(1, "İl seçiniz."),
  district: z.string().trim().min(1, "İlçe seçiniz."),
  workDescription: z.string().trim().min(20, "Çalışmalarınızı en az 20 karakterle açıklayın.").max(3000),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  consent: z.literal("on", { message: "Aydınlatma metni ve açık rıza onayı zorunludur." }),
  website: z.string().max(0, "Geçersiz gönderim."),
  startedAt: z.coerce.number(),
}).superRefine((data, ctx) => {
  const required = data.applicantType === "STUDENT"
    ? [["studentName", data.studentName], ["studentPhone", data.studentPhone], ["studentEmail", data.studentEmail]] as const
    : [["teacherName", data.teacherName], ["teacherPhone", data.teacherPhone], ["teacherEmail", data.teacherEmail]] as const;
  for (const [path, value] of required) if (!value) ctx.addIssue({ code: "custom", path: [path], message: "Bu alan zorunludur." });
  const activePhone = data.applicantType === "STUDENT" ? data.studentPhone : data.teacherPhone;
  const activeEmail = data.applicantType === "STUDENT" ? data.studentEmail : data.teacherEmail;
  if (activePhone && !phone.safeParse(activePhone).success) ctx.addIssue({ code: "custom", path: [data.applicantType === "STUDENT" ? "studentPhone" : "teacherPhone"], message: "Telefon +90 5xx xxx xx xx biçiminde olmalıdır." });
  if (activeEmail && !z.string().email().safeParse(activeEmail).success) ctx.addIssue({ code: "custom", path: [data.applicantType === "STUDENT" ? "studentEmail" : "teacherEmail"], message: "Geçerli bir e-posta adresi girin." });
});

export type ParticipationInput = z.infer<typeof participationSchema>;

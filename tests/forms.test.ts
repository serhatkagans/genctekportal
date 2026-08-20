import { describe, expect, it } from "vitest";
import { participationSchema } from "../lib/validation/participation";
import { safeCsvCell } from "../lib/forms/csv";
import { sanitizeRichText } from "../lib/content-services/sanitize";

const base = { applicantType:"STUDENT",studentName:"Ada Yılmaz",studentPhone:"+90 555 111 22 33",studentEmail:"ada@example.org",teacherName:"",teacherPhone:"",teacherEmail:"",institution:"Örnek Anadolu Lisesi",province:"Ankara",district:"Çankaya",workDescription:"Okulumuzda yapay zekâ atölyesi planlıyoruz.",notes:"",consent:"on",website:"",startedAt:Date.now()-5000 };

describe("participation validation",()=>{
 it("accepts a complete student application",()=>expect(participationSchema.safeParse(base).success).toBe(true));
 it("requires teacher identity for teacher applications",()=>expect(participationSchema.safeParse({...base,applicantType:"TEACHER",teacherName:"",teacherPhone:"",teacherEmail:""}).success).toBe(false));
 it("rejects the honeypot field",()=>expect(participationSchema.safeParse({...base,website:"bot"}).success).toBe(false));
});

describe("output safety",()=>{
 it("neutralizes spreadsheet formulas",()=>expect(safeCsvCell("=2+2")).toBe("\"'=2+2\""));
 it("removes scripts and unsafe attributes",()=>expect(sanitizeRichText('<p onclick="x()">Güvenli</p><script>alert(1)</script>')).toBe("<p>Güvenli</p>"));
});

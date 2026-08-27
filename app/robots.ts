import type { MetadataRoute } from "next";
import { siteAdresi } from "@/lib/ortam";
export default function robots():MetadataRoute.Robots{return{rules:{userAgent:"*",allow:"/",disallow:["/yonetim/","/api/","/giris","/mfa","/davet/"]},sitemap:`${siteAdresi()}/sitemap.xml`}}

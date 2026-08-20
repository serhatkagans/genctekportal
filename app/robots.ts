import type { MetadataRoute } from "next";
export default function robots():MetadataRoute.Robots{return{rules:{userAgent:"*",allow:"/",disallow:["/yonetim/","/api/","/giris","/mfa","/davet/"]},sitemap:"https://genctek.eba.gov.tr/sitemap.xml"}}

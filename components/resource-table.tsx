"use client";
import { useMemo, useState } from "react";
import { Icon } from "./icons";

export type ResourceRow={id:string;title:string;subtitle:string;status:string;meta:string};
export function ResourceTable({rows,searchLabel="Kayıtlarda ara",emptyMessage="Kayıt bulunamadı."}:{rows:ResourceRow[];searchLabel?:string;emptyMessage?:string}){
 const [query,setQuery]=useState(""); const filtered=useMemo(()=>rows.filter(r=>`${r.title} ${r.subtitle} ${r.status} ${r.meta}`.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR"))),[query,rows]);
 return <><div className="admin-toolbar"><label><Icon name="search"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={searchLabel}/></label><span className="result-count">{filtered.length} kayıt</span></div><section className="admin-panel"><div className="resource-list">{filtered.map(row=><article className="resource-row" key={row.id}><input type="checkbox" aria-label={`${row.title} seç`}/><div><strong>{row.title}</strong><span>{row.subtitle}</span></div><span className={`status ${row.status==="Yayında"||row.status==="Aktif"||row.status==="Hazır"?"status-published":""}`}>{row.status}</span><span>{row.meta}</span><button aria-label={`${row.title} işlemleri`}>•••</button></article>)}{filtered.length===0&&<div className="empty-admin"><strong>{emptyMessage}</strong><p>Arama ölçütlerini değiştirin veya yeni bir kayıt oluşturun.</p></div>}</div></section></>
}

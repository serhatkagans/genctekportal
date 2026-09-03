"use client";
import { useState } from "react";
import { apiYolu, uygulamaYolu } from "@/lib/ortam";

type Errors=Record<string,string[]>;
const districts:Record<string,string[]>={Ankara:["Çankaya","Keçiören","Yenimahalle"],Eskişehir:["Odunpazarı","Tepebaşı"],İzmir:["Bornova","Konak","Karşıyaka"]};

export function ParticipationForm(){
 const [type,setType]=useState<"STUDENT"|"TEACHER">("STUDENT"); const [province,setProvince]=useState(""); const [errors,setErrors]=useState<Errors>({}); const [reference,setReference]=useState(""); const [loading,setLoading]=useState(false); const [startedAt]=useState(()=>Date.now());
 async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setLoading(true);setErrors({});const response=await fetch(apiYolu("/api/basvurular"),{method:"POST",body:new FormData(event.currentTarget)});const result=await response.json();setLoading(false);if(!response.ok){setErrors(result.errors??{form:[result.message]});document.getElementById("form-errors")?.focus();return}setReference(result.reference);window.scrollTo({top:0,behavior:"smooth"});}
 if(reference)return <div className="public-form success-state" role="status"><span className="state-code">✓</span><h2>Başvurunuz alındı.</h2><p>Başvuru numaranızı saklayın:</p><strong>{reference}</strong><button className="button button-secondary" onClick={()=>setReference("")}>Yeni başvuru yap</button></div>;
 return <form className="public-form" onSubmit={submit} noValidate>
  <div className="form-progress"><span>Güvenli başvuru</span><span>Tüm zorunlu alanlar * ile işaretlidir</span></div>
  {Object.keys(errors).length>0&&<div id="form-errors" className="error-summary" role="alert" tabIndex={-1}><strong>Form gönderilemedi.</strong><ul>{Object.entries(errors).flatMap(([key,values])=>values.map(v=><li key={`${key}-${v}`}>{v}</li>))}</ul></div>}
  <input type="hidden" name="startedAt" value={startedAt}/><label className="honeypot">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
  <fieldset><legend>Başvuran kişi *</legend><div className="radio-grid"><label><input type="radio" name="applicantType" value="STUDENT" checked={type==="STUDENT"} onChange={()=>setType("STUDENT")}/> Öğrenci</label><label><input type="radio" name="applicantType" value="TEACHER" checked={type==="TEACHER"} onChange={()=>setType("TEACHER")}/> Danışman öğretmen</label></div></fieldset>
  {type==="STUDENT"?<><Field name="studentName" label="Öğrenci ad soyad" required errors={errors}/><Field name="studentPhone" label="Öğrenci telefonu" type="tel" placeholder="+90 5xx xxx xx xx" required errors={errors}/><Field name="studentEmail" label="Öğrenci e-posta" type="email" required errors={errors}/><Field name="teacherName" label="Danışman öğretmen (varsa)" errors={errors}/><Field name="teacherPhone" label="Danışman öğretmen telefonu (varsa)" type="tel" errors={errors}/></>:<><Field name="teacherName" label="Danışman öğretmen ad soyad" required errors={errors}/><Field name="teacherPhone" label="Danışman öğretmen telefonu" type="tel" placeholder="+90 5xx xxx xx xx" required errors={errors}/><Field name="teacherEmail" label="Danışman öğretmen e-posta" type="email" required errors={errors}/></>}
  <Field name="institution" label="Okul / kurum" required errors={errors}/>
  <div className="form-row"><label>İl *<select name="province" required value={province} onChange={e=>setProvince(e.target.value)} aria-invalid={!!errors.province}><option value="">İl seçin</option>{Object.keys(districts).map(p=><option key={p}>{p}</option>)}</select></label><label>İlçe *<select name="district" required defaultValue="" disabled={!province} aria-invalid={!!errors.district}><option value="">İlçe seçin</option>{(districts[province]??[]).map(d=><option key={d}>{d}</option>)}</select></label></div>
  <label>Yürütülen veya planlanan çalışmalar *<textarea name="workDescription" rows={6} minLength={20} maxLength={3000} required aria-invalid={!!errors.workDescription}/><small>En az 20 karakter; en fazla 3.000 karakter.</small></label>
  <label>Destekleyici dosya<input type="file" name="attachment" accept=".pdf,.jpg,.jpeg,.png,.webp"/><small>PDF, JPG, PNG veya WebP · en fazla 8 MB</small></label>
  <label>Eklemek istedikleriniz<textarea name="notes" rows={3} maxLength={2000}/></label>
  <label className="consent"><input type="checkbox" name="consent" required/><span><a href={uygulamaYolu("/kvkk")} target="_blank">KVKK aydınlatma metnini</a> okudum; başvurumun değerlendirilmesi için verilerimin işlenmesine açık rıza veriyorum. *</span></label>
  <button className="button button-primary" type="submit" disabled={loading}>{loading?"Gönderiliyor…":"Başvuruyu gönder"}</button><p className="form-note">Geliştirme ortamında başvurular yalnızca çalışan sunucu belleğinde tutulur; üretimde PostgreSQL ve özel nesne depolama kullanılır.</p>
 </form>
}

function Field({name,label,type="text",placeholder,required=false,errors}:{name:string;label:string;type?:string;placeholder?:string;required?:boolean;errors:Errors}){const described=errors[name]?.length?`${name}-error`:undefined;return <label>{label} {required&&<span aria-hidden="true">*</span>}<input name={name} type={type} placeholder={placeholder} required={required} aria-invalid={!!errors[name]} aria-describedby={described}/>{errors[name]?.map(e=><small className="field-error" id={`${name}-error`} role="alert" key={e}>{e}</small>)}</label>}

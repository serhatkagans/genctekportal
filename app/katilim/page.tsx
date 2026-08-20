import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ParticipationForm } from "@/components/participation-form";
export default function JoinPage(){return <><Header/><main><section className="page-hero compact"><div className="container"><span className="eyebrow">Ekosisteme katıl</span><h1>Üretim yolculuğun burada başlıyor.</h1><p>Bilgilerini paylaş; il koordinatörümüz seninle iletişime geçsin.</p></div></section><section className="section form-section"><ParticipationForm/></section></main><Footer/></>}

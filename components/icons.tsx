type IconProps = {
  name:
    | "arrow" | "calendar" | "location" | "search" | "plus" | "file" | "users"
    | "gauge" | "news" | "tag" | "image" | "form" | "inbox" | "shield" | "settings" | "redirect" | "badge";
};

export function Icon({ name }: IconProps) {
  const paths = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    plus: <path d="M12 5v14M5 12h14" />,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    gauge: <><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="m13.4 10.6 4.6-4.6"/><path d="M20.5 17a9 9 0 1 0-17 0"/></>,
    news: <><path d="M4 5h12a1 1 0 0 1 1 1v13H5a1 1 0 0 1-1-1Z"/><path d="M17 9h2a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2"/><path d="M7 8h6M7 12h6M7 16h4"/></>,
    tag: <><path d="M3 11V4a1 1 0 0 1 1-1h7l9 9-8 8-9-9Z"/><circle cx="7.5" cy="7.5" r="1.3"/></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.8"/><path d="m4 17 4.5-4.5a2 2 0 0 1 2.8 0L20 20"/></>,
    form: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h5M8 12h8M8 16h6"/></>,
    inbox: <><path d="M3 12h5l1.5 3h5L16 12h5"/><path d="M5.5 5h13l2.5 7v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Z"/></>,
    shield: <><path d="M12 3 5 6v5.5c0 4 2.9 7.6 7 9.5 4.1-1.9 7-5.5 7-9.5V6Z"/><path d="m9.5 12 1.8 1.8 3.4-3.4"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z"/></>,
    redirect: <><path d="M4 17h9a4 4 0 0 0 4-4V7"/><path d="m13.5 3.5 3.5 3.5-3.5 3.5"/><path d="m7.5 13.5-3.5 3.5 3.5 3.5"/></>,
    badge: <><circle cx="12" cy="9" r="5"/><path d="m8.5 13.2-1 7.3 4.5-2.5 4.5 2.5-1-7.3"/></>,
  };
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

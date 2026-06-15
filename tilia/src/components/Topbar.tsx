import { useEffect, useState } from 'react';
import { useApp } from '../store';

export default function Topbar() {
  const { lang, setLang, tr, data, update, setLoggedIn, toast } = useApp();
  const [open, setOpen] = useState<'notif' | 'acct' | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [open]);

  const unread = data.notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    update((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) }));

  return (
    <header className="topbar">
      <div className="lang-switch">
        <button className={lang === 'pl' ? 'active' : ''} onClick={() => setLang('pl')}>PL</button>
        <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
      </div>
      <div className="dd-wrap">
        <button
          className="icon-btn"
          title={tr.top.notifs}
          onClick={(e) => { e.stopPropagation(); setOpen(open === 'notif' ? null : 'notif'); }}
        >
          🔔{unread > 0 && <span className="badge">{unread}</span>}
        </button>
        {open === 'notif' && (
          <div className="dropdown" onClick={(e) => e.stopPropagation()}>
            <div className="dd-head">
              {tr.top.notifs}
              {unread > 0 && <button onClick={markAllRead}>{tr.top.markRead}</button>}
            </div>
            {data.notifications.length ? (
              data.notifications.map((n, i) => (
                <div key={i} className={`notif-item ${n.read ? '' : 'unread'}`}>
                  <span className="n-ico">{n.ico}</span>
                  <div style={{ flex: 1 }}>
                    {n[lang]}
                    <div className="n-when">{n.when[lang]}</div>
                  </div>
                  {!n.read && <span className="n-dot" />}
                </div>
              ))
            ) : (
              <div className="notif-item muted">{tr.top.noNotifs}</div>
            )}
          </div>
        )}
      </div>
      <div className="dd-wrap">
        <div
          className="acct"
          onClick={(e) => { e.stopPropagation(); setOpen(open === 'acct' ? null : 'acct'); }}
        >
          <span className="avatar">AK</span>
          <span>Ania K.</span>
          <span className="chev">▼</span>
        </div>
        {open === 'acct' && (
          <div className="dropdown" style={{ minWidth: 220 }} onClick={(e) => e.stopPropagation()}>
            <div className="dd-head">ania.k@example.com</div>
            <button className="dd-item" onClick={() => toast(tr.top.soon)}>👤 {tr.top.profile}</button>
            <button className="dd-item" onClick={() => toast(tr.top.soon)}>⚙️ {tr.top.settings}</button>
            <button className="dd-item" onClick={() => toast(tr.top.soon)}>💳 {tr.top.billing}</button>
            <hr className="dd-sep" />
            <button className="dd-item danger" onClick={() => { setOpen(null); setLoggedIn(false); }}>↩ {tr.top.logout}</button>
          </div>
        )}
      </div>
    </header>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { WEDDING_DATE } from '../seed';

function useCountdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, WEDDING_DATE.getTime() - now);
  return {
    d: Math.floor(diff / 864e5),
    h: Math.floor((diff % 864e5) / 36e5),
    m: Math.floor((diff % 36e5) / 6e4),
    s: Math.floor((diff % 6e4) / 1e3),
  };
}

export default function Dashboard() {
  const { lang, tr, data, money } = useApp();
  const nav = useNavigate();
  const cd = useCountdown();

  const tasksLeft = data.tasks.filter((x) => !x.done).slice(0, 4);
  const doneN = data.tasks.filter((x) => x.done).length;
  const taskPct = Math.round((doneN / data.tasks.length) * 100);
  const spent = data.budget.expenses.reduce((s, e) => s + e.amt, 0);
  const pct = Math.min(100, Math.round((spent / data.budget.total) * 100));
  const yes = data.guests.filter((g) => g.rsvp === 'yes').length;
  const no = data.guests.filter((g) => g.rsvp === 'no').length;
  const pend = data.guests.filter((g) => g.rsvp === 'pending').length;
  const seated = data.guests.filter((g) => g.rsvp === 'yes' && g.table).length;
  const pendingExp = data.budget.expenses.filter((e) => !e.paid).slice(0, 3);
  const vBooked = data.vendors.filter((v) => v.stage >= 2).length;
  const vPaid = data.vendors.filter((v) => v.stage === 3).length;
  const vTalks = data.vendors.filter((v) => v.stage < 2).length;

  const cdUnits: [number, string][] = [
    [cd.d, tr.dash.days], [cd.h, tr.dash.hours], [cd.m, tr.dash.mins], [cd.s, tr.dash.secs],
  ];

  return (
    <>
      <h1 className="page-title names">Ania <em>&amp;</em> Tomek</h1>
      <p className="page-sub">{tr.dash.sub} · {lang === 'pl' ? '12 września 2026, Dwór Lipowy' : '12 September 2026, Dwór Lipowy'}</p>
      <div className="countdown-card mb">
        <div className="cd-title">{tr.dash.cdTitle}</div>
        <div className="cd-units">
          {cdUnits.map(([n, l], i) => (
            <div key={i}>
              <div className="cd-num">{n}</div>
              <div className="cd-lbl">{l}</div>
            </div>
          ))}
        </div>
        <div className="cd-rule" />
        <div className="cd-date">{lang === 'pl' ? '12 września 2026, 15:00' : '12 September 2026, 3:00 PM'}</div>
      </div>
      <div className="grid dash-grid">
        <div className="card">
          <div className="spread"><h3>{tr.dash.nextTasks}</h3><button className="btn sm" onClick={() => nav('/planning')}>{tr.dash.seeAll}</button></div>
          <ul className="mini-list mt">
            {tasksLeft.map((x) => (
              <li key={x.id}><span>{x[lang]}</span><span className="muted">{x.due.slice(5).split('-').reverse().join('.')}</span></li>
            ))}
          </ul>
        </div>
        <div className="card tint-gold">
          <div className="spread"><h3>{tr.dash.budgetUsed}</h3><button className="btn sm gold" onClick={() => nav('/budget')}>{tr.dash.seeAll}</button></div>
          <div className="stat-num mt">{pct}%</div>
          <div className="muted">{money(spent)} {tr.dash.of} {money(data.budget.total)} {tr.dash.spent}</div>
          <div className="bar"><i style={{ width: `${pct}%` }} /></div>
        </div>
        <div className="card tint-green">
          <div className="spread"><h3>{tr.dash.rsvps}</h3><button className="btn sm leaf" onClick={() => nav('/guests')}>{tr.dash.seeAll}</button></div>
          <div className="stat-num mt" style={{ color: 'var(--leaf)' }}>{yes}</div>
          <div className="muted">{tr.dash.confirmed} · {no} {tr.dash.declined} · {pend} {tr.dash.pending}</div>
        </div>
        <div className="card tint-sand">
          <div className="spread"><h3>{tr.dash.payments}</h3><button className="btn sm gold" onClick={() => nav('/budget')}>{tr.dash.seeAll}</button></div>
          <ul className="mini-list mt">
            {pendingExp.length ? pendingExp.map((e) => (
              <li key={e.id}><span>{e.name[lang] || e.name.en}</span><span className="pend">{money(e.amt)}</span></li>
            )) : <li className="muted">—</li>}
          </ul>
        </div>
        <div className="card tint-olive">
          <div className="spread"><h3>{tr.dash.vendorsCard}</h3><button className="btn sm" onClick={() => nav('/vendors')}>{tr.dash.seeAll}</button></div>
          <div className="stat-num mt">{vBooked}/{data.vendors.length}</div>
          <div className="muted">{tr.dash.booked} · {vPaid} {tr.dash.paidV} · {vTalks} {tr.dash.inTalks}</div>
        </div>
        <div className="card tint-cream">
          <div className="spread"><h3>{tr.dash.checklist}</h3><button className="btn sm" onClick={() => nav('/planning')}>{tr.dash.seeAll}</button></div>
          <div className="stat-num mt">{doneN}/{data.tasks.length}</div>
          <div className="muted">{tr.dash.tasksDone} · {seated}/{yes} {tr.dash.seatedTxt}</div>
          <div className="bar"><i className="leaf" style={{ width: `${taskPct}%` }} /></div>
        </div>
      </div>
    </>
  );
}

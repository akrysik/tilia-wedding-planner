import { useState } from 'react';
import { useApp, sortDayOf } from '../store';
import { T } from '../i18n';
import type { Assignee, DayOfItem, Task, Timeframe } from '../types';

const TFS: Timeframe[] = ['m12', 'm6', 'm1', 'w1', 'd0'];
type PlanTab = 'calendar' | 'checklist' | 'dayof';

export default function Planning() {
  const { tr } = useApp();
  const [tab, setTab] = useState<PlanTab>('calendar');
  const tabs: PlanTab[] = ['calendar', 'checklist', 'dayof'];
  return (
    <>
      <h1 className="page-title">{tr.plan.title}</h1>
      <p className="page-sub">{tr.plan.sub}</p>
      <div className="tabs">
        {tabs.map((tb) => (
          <button key={tb} className={tab === tb ? 'active' : ''} onClick={() => setTab(tb)}>{tr.plan.tabs[tb]}</button>
        ))}
      </div>
      {tab === 'calendar' && <CalendarTab />}
      {tab === 'checklist' && <ChecklistTab />}
      {tab === 'dayof' && <DayOfTab />}
    </>
  );
}

/* ===== Shared task edit box ===== */
function TaskEditBox({ task, onClose }: { task: Task; onClose: () => void }) {
  const { lang, tr, update } = useApp();
  const [title, setTitle] = useState(task[lang]);
  const [det, setDet] = useState(task.det?.[lang] || '');
  const [tf, setTf] = useState<Timeframe>(task.tf);
  const [who, setWho] = useState<Assignee>(task.who);
  const [due, setDue] = useState(task.due);

  const save = () => {
    update((d) => ({
      ...d,
      tasks: d.tasks.map((x) => {
        if (x.id !== task.id) return x;
        const t = title.trim();
        return {
          ...x,
          ...(t ? { en: t, pl: t } : {}),
          det: { en: det.trim(), pl: det.trim() },
          tf, who, due: due || x.due,
        };
      }),
    }));
    onClose();
  };
  const del = () => {
    update((d) => ({ ...d, tasks: d.tasks.filter((x) => x.id !== task.id) }));
    onClose();
  };

  return (
    <div className="edit-box" style={{ marginTop: 12 }}>
      <div><label>{tr.plan.fTitle}</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%' }} /></div>
      <div><label>{tr.plan.fDetails}</label><input type="text" value={det} onChange={(e) => setDet(e.target.value)} style={{ width: '100%' }} /></div>
      <div><label>{tr.plan.fTf}</label>
        <select value={tf} onChange={(e) => setTf(e.target.value as Timeframe)} style={{ width: '100%' }}>
          {TFS.map((x) => <option key={x} value={x}>{tr.plan.tf[x]}</option>)}
        </select>
      </div>
      <div><label>{tr.plan.fWho}</label>
        <select value={who} onChange={(e) => setWho(e.target.value as Assignee)} style={{ width: '100%' }}>
          {(Object.keys(T.en.plan.who) as Assignee[]).map((w) => <option key={w} value={w}>{tr.plan.who[w]}</option>)}
        </select>
      </div>
      <div><label>{tr.plan.fDue}</label><input type="date" value={due} onChange={(e) => setDue(e.target.value)} style={{ width: '100%' }} /></div>
      <div className="full row">
        <button className="btn" onClick={save}>{tr.plan.save}</button>
        <button className="btn sm gold" onClick={onClose}>{tr.plan.cancel}</button>
        <button className="btn sm danger" onClick={del}>🗑 {tr.plan.del}</button>
      </div>
    </div>
  );
}

/* ===== Calendar ===== */
function CalendarTab() {
  const { lang, tr, data } = useApp();
  const [calY, setCalY] = useState(2026);
  const [calM, setCalM] = useState(8); // September 2026
  const [editing, setEditing] = useState<number | null>(null);

  const move = (dir: number) => {
    let m = calM + dir, y = calY;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setCalM(m); setCalY(y);
  };

  const months = T[lang].plan.months;
  const dows = T[lang].plan.dows;
  const daysIn = new Date(calY, calM + 1, 0).getDate();
  const firstDow = (new Date(calY, calM, 1).getDay() + 6) % 7;
  const prefix = String(calY) + '-' + String(calM + 1).padStart(2, '0');
  const evts: Record<number, Task[]> = {};
  data.tasks.filter((x) => x.due.startsWith(prefix)).forEach((x) => {
    const d = +x.due.slice(8);
    (evts[d] = evts[d] || []).push(x);
  });

  const cells: React.ReactNode[] = [];
  dows.forEach((d, i) => cells.push(<div key={`dow${i}`} className="dow">{d}</div>));
  for (let i = 0; i < firstDow; i++) cells.push(<div key={`e${i}`} className="cal-cell empty" />);
  for (let d = 1; d <= daysIn; d++) {
    const isWed = calY === 2026 && calM === 8 && d === 12;
    cells.push(
      <div key={`d${d}`} className={`cal-cell ${isWed ? 'wday' : ''}`}>
        <div className="d">{d}</div>
        {isWed && (
          <div className="cal-evt" style={{ borderLeftColor: 'var(--gold)', fontWeight: 700, cursor: 'default' }}>
            {tr.plan.weddingDay}<div className="ew">15:00 · Dwór Lipowy</div>
          </div>
        )}
        {(evts[d] || []).map((x) => (
          <div key={x.id} className={`cal-evt ${x.done ? 'evt-done' : ''}`} onClick={() => setEditing(x.id)} title={x.det?.[lang] || ''}>
            <b>{x[lang]}</b>
            <div className="ew">{tr.plan.who[x.who]}{x.det?.[lang] ? ' · ' + x.det[lang] : ''}</div>
          </div>
        ))}
      </div>,
    );
  }

  const editTask = editing !== null ? data.tasks.find((x) => x.id === editing) : null;

  return (
    <div className="card">
      <div className="cal-head">
        <button className="cal-nav" onClick={() => move(-1)}>‹</button>
        <h3>{months[calM]} {calY}</h3>
        <button className="cal-nav" onClick={() => move(1)}>›</button>
      </div>
      <div className="calendar">{cells}</div>
      {editTask ? (
        <TaskEditBox task={editTask} onClose={() => setEditing(null)} />
      ) : (
        <p className="muted" style={{ marginTop: 12 }}>{tr.plan.clickToEdit}</p>
      )}
    </div>
  );
}

/* ===== Checklist ===== */
function ChecklistTab() {
  const { lang, tr, data, update, toast } = useApp();
  const [editing, setEditing] = useState<number | null>(null);
  const [newTask, setNewTask] = useState('');
  const [newDet, setNewDet] = useState('');
  const [newTf, setNewTf] = useState<Timeframe>('m12');
  const [newWho, setNewWho] = useState<Assignee>('me');
  const [newDue, setNewDue] = useState('2026-07-01');

  const toggle = (id: number) =>
    update((d) => ({ ...d, tasks: d.tasks.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) }));

  const add = () => {
    const v = newTask.trim();
    if (!v) return;
    update((d) => ({
      ...d,
      tasks: [...d.tasks, { id: Date.now(), tf: newTf, en: v, pl: v, det: { en: newDet.trim(), pl: newDet.trim() }, who: newWho, due: newDue || '2026-07-01', done: false }],
    }));
    setNewTask(''); setNewDet('');
  };

  return (
    <div className="card">
      {TFS.map((tf) => {
        const tasks = data.tasks.filter((x) => x.tf === tf);
        const done = tasks.filter((x) => x.done).length;
        return (
          <div key={tf}>
            <div className="tf-head">{tr.plan.tf[tf]} <span className="chip" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>{done}/{tasks.length}</span></div>
            {tasks.map((x) =>
              editing === x.id ? (
                <TaskEditBox key={x.id} task={x} onClose={() => setEditing(null)} />
              ) : (
                <div key={x.id} className={`task ${x.done ? 'done' : ''}`}>
                  <input type="checkbox" checked={x.done} onChange={() => toggle(x.id)} />
                  <div style={{ flex: 1 }}>
                    <div className="t-title">{x[lang]}</div>
                    <div className="t-meta">{tr.plan.due}: {x.due.split('-').reverse().join('.')} · {tr.plan.who[x.who]}</div>
                    {x.det?.[lang] && <div className="t-meta" style={{ color: 'var(--accent)' }}>↳ {x.det[lang]}</div>}
                  </div>
                  <button className="btn sm gold" onClick={() => toast(tr.plan.remind)}>⏰</button>
                  <button className="btn sm" onClick={() => setEditing(x.id)}>✎ {tr.plan.edit}</button>
                </div>
              ),
            )}
          </div>
        );
      })}
      <hr className="hairline" />
      <div className="row">
        <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder={tr.plan.taskPh} style={{ flex: 1, minWidth: 140 }} />
        <input type="text" value={newDet} onChange={(e) => setNewDet(e.target.value)} placeholder={tr.plan.detPh} style={{ flex: 1, minWidth: 140 }} />
        <select value={newTf} onChange={(e) => setNewTf(e.target.value as Timeframe)}>{TFS.map((tf) => <option key={tf} value={tf}>{tr.plan.tf[tf]}</option>)}</select>
        <select value={newWho} onChange={(e) => setNewWho(e.target.value as Assignee)}>{(Object.keys(T.en.plan.who) as Assignee[]).map((w) => <option key={w} value={w}>{tr.plan.who[w]}</option>)}</select>
        <input type="date" value={newDue} onChange={(e) => setNewDue(e.target.value)} />
        <button className="btn" onClick={add}>{tr.plan.addTask}</button>
      </div>
    </div>
  );
}

/* ===== Day-of timeline ===== */
function DayOfEditBox({ item, onClose }: { item: DayOfItem; onClose: () => void }) {
  const { lang, tr, update } = useApp();
  const [time, setTime] = useState(item.time);
  const [title, setTitle] = useState(item[lang]);
  const [det, setDet] = useState(item.det?.[lang] || '');

  const save = () => {
    update((d) => {
      const items = d.dayOf.map((x) => {
        if (x.id !== item.id) return x;
        const tm = time.trim();
        const t = title.trim();
        return {
          ...x,
          ...(/^\d{1,2}:\d{2}$/.test(tm) ? { time: tm.padStart(5, '0') } : {}),
          ...(t ? { en: t, pl: t } : {}),
          det: { en: det.trim(), pl: det.trim() },
        };
      });
      return { ...d, dayOf: sortDayOf(items) };
    });
    onClose();
  };
  const del = () => {
    update((d) => ({ ...d, dayOf: d.dayOf.filter((x) => x.id !== item.id) }));
    onClose();
  };

  return (
    <div className="edit-box" style={{ margin: '8px 0' }}>
      <div><label>{tr.plan.fTime}</label><input type="text" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: '100%' }} /></div>
      <div><label>{tr.plan.fTitle}</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%' }} /></div>
      <div className="full"><label>{tr.plan.fDetails}</label><input type="text" value={det} onChange={(e) => setDet(e.target.value)} style={{ width: '100%' }} /></div>
      <div className="full row">
        <button className="btn" onClick={save}>{tr.plan.save}</button>
        <button className="btn sm gold" onClick={onClose}>{tr.plan.cancel}</button>
        <button className="btn sm danger" onClick={del}>🗑 {tr.plan.delItem}</button>
      </div>
    </div>
  );
}

function DayOfTab() {
  const { lang, tr, data, update, toast } = useApp();
  const [editing, setEditing] = useState<number | null>(null);
  const [doTime, setDoTime] = useState('22:00');
  const [doTitle, setDoTitle] = useState('');
  const [doDet, setDoDet] = useState('');

  const add = () => {
    const ti = doTitle.trim();
    if (!ti) return;
    let tm = doTime.trim();
    if (!/^\d{1,2}:\d{2}$/.test(tm)) tm = '22:00';
    update((d) => ({
      ...d,
      dayOf: sortDayOf([...d.dayOf, { id: Date.now(), time: tm.padStart(5, '0'), en: ti, pl: ti, det: { en: doDet.trim(), pl: doDet.trim() } }]),
    }));
    setDoTitle(''); setDoDet('');
  };

  return (
    <div className="card">
      <div className="spread mb">
        <h3>{tr.plan.tabs.dayof}</h3>
        <button className="btn" onClick={() => toast(tr.plan.shared)}>{tr.plan.shareTimeline}</button>
      </div>
      <div>
        {data.dayOf.map((x) =>
          editing === x.id ? (
            <DayOfEditBox key={x.id} item={x} onClose={() => setEditing(null)} />
          ) : (
            <div key={x.id} className="timeline-item">
              <div className="time">{x.time}</div>
              <div className="dot" />
              <div className="what" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <strong>{x[lang]}</strong>
                  {x.det?.[lang] && <div className="t-meta" style={{ color: 'var(--accent)' }}>↳ {x.det[lang]}</div>}
                </div>
                <button className="btn sm" onClick={() => setEditing(x.id)}>✎ {tr.plan.edit}</button>
              </div>
            </div>
          ),
        )}
      </div>
      <hr className="hairline" />
      <div className="row">
        <input type="text" value={doTime} onChange={(e) => setDoTime(e.target.value)} style={{ width: 74 }} />
        <input type="text" value={doTitle} onChange={(e) => setDoTitle(e.target.value)} placeholder={tr.plan.itemPh} style={{ flex: 1, minWidth: 140 }} />
        <input type="text" value={doDet} onChange={(e) => setDoDet(e.target.value)} placeholder={tr.plan.detPh} style={{ flex: 1, minWidth: 140 }} />
        <button className="btn" onClick={add}>{tr.plan.addItem}</button>
      </div>
    </div>
  );
}

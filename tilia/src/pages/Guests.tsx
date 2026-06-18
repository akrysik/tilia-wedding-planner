import { useRef, useState } from 'react';
import { useApp, gname } from '../store';
import { T } from '../i18n';
import { ROUND_MAX, ROUND_MIN } from '../seed';
import type { Guest, GuestGroup, Rsvp, SeatingTable, TableShape } from '../types';

const GROUPS: GuestGroup[] = ['brideFam', 'groomFam', 'friends'];

/* ===== Seating geometry (ported from prototype tableGeo/chairsHTML) ===== */
interface Geo {
  W: number; H: number; seated: Guest[];
  shapeStyle: React.CSSProperties;
  tw?: number; th?: number; shapeD?: number;
}

function tableGeo(tb: SeatingTable, guests: Guest[]): Geo {
  const seated = guests.filter((g) => g.table === tb.id).sort((a, b) => (a.seat || 0) - (b.seat || 0));
  if (tb.shape === 'round') {
    const W = 270, H = 250, shapeD = 110;
    return {
      W, H, shapeD, seated,
      shapeStyle: { width: shapeD, height: shapeD, borderRadius: '50%', left: (W - shapeD) / 2, top: (H - shapeD) / 2 },
    };
  }
  const perSide = Math.max(1, Math.ceil(seated.length / 2));
  const tw = Math.max(150, perSide * 92 + 24);
  const W = tw + 24, H = 190, th = 64;
  return {
    W, H, tw, th, seated,
    shapeStyle: { width: tw, height: th, borderRadius: 12, left: (W - tw) / 2, top: (H - th) / 2 },
  };
}

function chairPositions(tb: SeatingTable, geo: Geo): { g: Guest; x: number; y: number }[] {
  if (tb.shape === 'round') {
    const cx = geo.W / 2, cy = geo.H / 2, r = geo.shapeD! / 2 + 34;
    const n = geo.seated.length;
    return geo.seated.map((g, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(n, 1);
      return { g, x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
  }
  const topY = (geo.H - geo.th!) / 2 - 22, botY = (geo.H + geo.th!) / 2 + 22;
  return geo.seated.map((g, i) => {
    const side = i % 2, slot = Math.floor(i / 2);
    const x = (geo.W - geo.tw!) / 2 + 46 + slot * 92;
    return { g, x, y: side === 0 ? topY : botY };
  });
}

const nextSeat = (guests: Guest[]) => Math.max(99, ...guests.map((g) => g.seat || 0)) + 1;

export default function Guests() {
  const { lang, tr, data, update, toast } = useApp();
  const [filter, setFilter] = useState<'all' | GuestGroup>('all');
  const [editing, setEditing] = useState<number | null>(null);
  const [editingTable, setEditingTable] = useState<number | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [newFirst, setNewFirst] = useState('');
  const [newLast, setNewLast] = useState('');
  const [newGroup, setNewGroup] = useState<GuestGroup>('brideFam');
  const [tName, setTName] = useState('');
  const [tShape, setTShape] = useState<TableShape>('round');

  const shown = data.guests.filter((g) => filter === 'all' || g.group === filter);
  const unseated = data.guests.filter((g) => g.rsvp === 'yes' && !g.table);

  const cycleRsvp = (id: number) =>
    update((d) => ({
      ...d,
      guests: d.guests.map((g) => {
        if (g.id !== id) return g;
        const rsvp: Rsvp = g.rsvp === 'pending' ? 'yes' : g.rsvp === 'yes' ? 'no' : 'pending';
        return { ...g, rsvp, table: rsvp !== 'yes' ? null : g.table };
      }),
    }));

  const addGuest = () => {
    const f = newFirst.trim();
    if (!f) return;
    update((d) => ({
      ...d,
      guests: [...d.guests, { id: Date.now(), first: f, last: newLast.trim(), group: newGroup, phone: '—', address: '', notes: { en: '', pl: '' }, rsvp: 'pending', table: null }],
    }));
    setNewFirst(''); setNewLast('');
  };

  const addTable = () => {
    const name = tName.trim();
    update((d) => {
      const number = Math.max(0, ...d.tables.map((t) => t.number || 0)) + 1;
      return {
        ...d,
        tables: [...d.tables, { id: Date.now(), number, shape: tShape, name: { en: name, pl: name }, x: 20 + Math.random() * 80, y: 20 + Math.random() * 60 }],
      };
    });
    setTName('');
  };

  const saveTable = (id: number, number: number, name: string) => {
    update((d) => ({
      ...d,
      tables: d.tables.map((t) => (t.id === id ? { ...t, number, name: { en: name, pl: name } } : t)),
    }));
    setEditingTable(null);
  };

  const removeTable = (id: number) => {
    if (!confirm(tr.guests.removeTable)) return;
    update((d) => ({
      ...d,
      guests: d.guests.map((g) => (g.table === id ? { ...g, table: null } : g)),
      tables: d.tables.filter((tb) => tb.id !== id),
    }));
  };

  const unseat = (id: number) =>
    update((d) => ({ ...d, guests: d.guests.map((g) => (g.id === id ? { ...g, table: null } : g)) }));

  const trySeat = (guestId: number, tid: number) => {
    const tb = data.tables.find((x) => x.id === tid);
    if (!tb) return;
    const seatedCount = data.guests.filter((g) => g.table === tid).length;
    if (tb.shape === 'round' && seatedCount >= ROUND_MAX) { toast(tr.guests.tableFull); return; }
    update((d) => {
      const seat = nextSeat(d.guests);
      return { ...d, guests: d.guests.map((g) => (g.id === guestId ? { ...g, table: tid, seat } : g)) };
    });
    setPicked(null);
  };

  const pickGuest = (id: number) => setPicked((p) => (p === id ? null : id));

  // chair dropped onto another chair: swap within table, or move between tables
  const dropOnChair = (data_str: string, targetId: number) => {
    if (data_str.startsWith('chair:')) {
      const srcId = +data_str.slice(6);
      if (srcId === targetId) return;
      const src = data.guests.find((g) => g.id === srcId);
      const target = data.guests.find((g) => g.id === targetId);
      if (!src || !target) return;
      if (src.table === target.table) {
        update((d) => ({
          ...d,
          guests: d.guests.map((g) => {
            if (g.id === src.id) return { ...g, seat: target.seat };
            if (g.id === target.id) return { ...g, seat: src.seat };
            return g;
          }),
        }));
      } else if (target.table != null) {
        trySeat(src.id, target.table);
      }
    } else {
      const gid = +data_str;
      const target = data.guests.find((g) => g.id === targetId);
      if (gid && target?.table != null) trySeat(gid, target.table);
    }
  };

  const rsvpChip = (g: Guest) => (
    <span className={`chip rsvp ${g.rsvp}`} title={tr.guests.tapRsvp} onClick={() => cycleRsvp(g.id)}>{tr.guests.rsvps[g.rsvp]}</span>
  );

  return (
    <>
      <h1 className="page-title">{tr.guests.title}</h1>
      <p className="page-sub">{tr.guests.sub}</p>
      <div className="card">
        <div className="filter-bar">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>{tr.guests.all} ({data.guests.length})</button>
          {GROUPS.map((g) => (
            <button key={g} className={filter === g ? 'active' : ''} onClick={() => setFilter(g)}>{tr.guests.groups[g]} ({data.guests.filter((x) => x.group === g).length})</button>
          ))}
        </div>
        <div className="guest-row" style={{ borderBottom: '2px solid var(--line)' }}>
          <strong>{tr.guests.name}</strong><strong>{tr.guests.group}</strong><strong>{tr.guests.rsvp}</strong><strong>{tr.guests.table}</strong><strong>{tr.guests.notes}</strong><span />
        </div>
        {shown.map((g) =>
          editing === g.id ? (
            <GuestEditBox key={g.id} guest={g} onClose={() => setEditing(null)} />
          ) : (
            <div key={g.id} className="guest-row">
              <div><strong>{gname(g)}</strong><div className="muted">{g.phone}{g.address ? ' · ' + g.address : ''}</div></div>
              <div><span className="chip" style={{ borderColor: 'var(--card2)', color: 'var(--muted)' }}>{tr.guests.groups[g.group]}</span></div>
              <div>{rsvpChip(g)}</div>
              <div>{g.table ? (data.tables.find((tb) => tb.id === g.table)?.name[lang] || '#' + g.table) : tr.guests.none}</div>
              <div className="muted">{g.notes[lang] || g.notes.en || tr.guests.none}</div>
              <div><button className="btn sm gold" onClick={() => setEditing(g.id)}>✎ {tr.guests.edit}</button></div>
            </div>
          ),
        )}
        <hr className="hairline" />
        <div className="row">
          <input type="text" value={newFirst} onChange={(e) => setNewFirst(e.target.value)} placeholder={tr.guests.firstPh} style={{ flex: 1, minWidth: 110 }} />
          <input type="text" value={newLast} onChange={(e) => setNewLast(e.target.value)} placeholder={tr.guests.lastPh} style={{ flex: 1, minWidth: 110 }} />
          <select value={newGroup} onChange={(e) => setNewGroup(e.target.value as GuestGroup)}>{GROUPS.map((g) => <option key={g} value={g}>{tr.guests.groups[g]}</option>)}</select>
          <button className="btn" onClick={addGuest}>{tr.guests.addGuest}</button>
        </div>
      </div>

      <div className="card mt">
        <h3 className="seating-head">{tr.guests.seating}</h3>
        <p className="muted" style={{ margin: '6px 0 12px' }}>{tr.guests.seatHint}</p>
        <div className="row mb">
          <input type="text" value={tName} onChange={(e) => setTName(e.target.value)} placeholder={tr.guests.tableName} style={{ minWidth: 140 }} />
          <select value={tShape} onChange={(e) => setTShape(e.target.value as TableShape)}>
            <option value="round">{tr.guests.round}</option>
            <option value="rect">{tr.guests.rect}</option>
          </select>
          <button className="btn" onClick={addTable}>{tr.guests.addTable}</button>
        </div>
        <div className="seat-floor">
          {data.tables.map((tb) => (
            <TableObj
              key={tb.id}
              tb={tb}
              guests={data.guests}
              lang={lang}
              picked={picked}
              notFilledLabel={tr.guests.notFilled}
              tableWord={tr.guests.tableLabel}
              onCommit={(x, y) => update((d) => ({ ...d, tables: d.tables.map((t) => (t.id === tb.id ? { ...t, x, y } : t)) }))}
              onClickSeat={() => picked != null && trySeat(picked, tb.id)}
              onDropGuest={(s) => { if (s.startsWith('chair:')) trySeat(+s.slice(6), tb.id); else if (+s) trySeat(+s, tb.id); }}
              onRemove={() => removeTable(tb.id)}
              onEdit={() => setEditingTable(tb.id)}
              onUnseat={unseat}
              onDropOnChair={dropOnChair}
            />
          ))}
        </div>
        <div className="mt">
          <strong style={{ fontSize: 13 }}>{tr.guests.unseated}:</strong><br />
          {unseated.length ? unseated.map((g) => (
            <span
              key={g.id}
              className={`seat-guest ${picked === g.id ? 'picked' : ''}`}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', String(g.id))}
              onClick={() => pickGuest(g.id)}
            >
              {gname(g)}
            </span>
          )) : <span className="muted">—</span>}
        </div>
      </div>

      {editingTable !== null && (() => {
        const tb = data.tables.find((t) => t.id === editingTable);
        return tb ? (
          <TableEditModal tb={tb} onClose={() => setEditingTable(null)} onSave={(num, nm) => saveTable(tb.id, num, nm)} />
        ) : null;
      })()}
    </>
  );
}

/* ===== Table edit modal (number + name) ===== */
function TableEditModal({ tb, onClose, onSave }: { tb: SeatingTable; onClose: () => void; onSave: (number: number, name: string) => void }) {
  const { lang, tr } = useApp();
  const [num, setNum] = useState(String(tb.number));
  const [name, setName] = useState(tb.name[lang] || tb.name.en);

  const save = () => {
    const n = Math.max(1, Math.round(+num) || tb.number);
    onSave(n, name.trim());
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h3>{tr.guests.editTable}</h3>
        <label>{tr.guests.fTableNum}</label>
        <input type="number" min={1} value={num} onChange={(e) => setNum(e.target.value)} autoFocus />
        <label>{tr.guests.fTableName}</label>
        <input type="text" value={name} placeholder={tr.guests.tableName} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && save()} />
        <div className="row">
          <button className="btn" onClick={save}>{tr.guests.save}</button>
          <button className="btn sm gold" onClick={onClose}>{tr.guests.cancel}</button>
        </div>
      </div>
    </div>
  );
}

/* ===== A single draggable table on the floor ===== */
interface TableObjProps {
  tb: SeatingTable;
  guests: Guest[];
  lang: 'en' | 'pl';
  picked: number | null;
  notFilledLabel: string;
  tableWord: string;
  onCommit: (x: number, y: number) => void;
  onClickSeat: () => void;
  onDropGuest: (data: string) => void;
  onRemove: () => void;
  onEdit: () => void;
  onUnseat: (id: number) => void;
  onDropOnChair: (data: string, targetId: number) => void;
}

function TableObj(props: TableObjProps) {
  const { tb, guests, lang, picked, notFilledLabel, tableWord, onCommit, onClickSeat, onDropGuest, onRemove, onEdit, onUnseat, onDropOnChair } = props;
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  const geo = tableGeo(tb, guests);
  const n = geo.seated.length;
  const under = tb.shape === 'round' && n < ROUND_MIN;
  const capTxt = tb.shape === 'round' ? `${n}/${ROUND_MAX}` : `${n} · ∞`;
  const chairs = chairPositions(tb, geo);
  const name = tb.name[lang] || tb.name.en;

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { active: true, moved: false, startX: e.clientX, startY: e.clientY, origX: tb.x, origY: tb.y };
    ref.current?.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX, dy = e.clientY - drag.current.startY;
    const el = ref.current!;
    if (!drag.current.moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      drag.current.moved = true;
      el.classList.add('dragging'); // subtle lift while moving (no re-render)
    }
    const floor = el.parentElement!;
    const fw = floor.clientWidth, fh = floor.clientHeight;
    const nx = Math.max(-30, Math.min(fw - el.offsetWidth + 30, drag.current.origX + dx));
    const ny = Math.max(-20, Math.min(fh - el.offsetHeight + 20, drag.current.origY + dy));
    el.style.left = nx + 'px';
    el.style.top = ny + 'px';
  };
  const onPointerUp = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    const el = ref.current!;
    el.classList.remove('dragging');
    const x = parseFloat(el.style.left), y = parseFloat(el.style.top);
    if (!drag.current.moved && picked != null) {
      el.style.left = tb.x + 'px';
      el.style.top = tb.y + 'px';
      onClickSeat();
    } else {
      onCommit(x, y);
    }
  };

  return (
    <div
      ref={ref}
      className={`table-obj ${tb.shape} ${under ? 'underfilled' : ''} ${picked != null ? 'selected' : ''}`}
      style={{ left: tb.x, top: tb.y, width: geo.W, height: geo.H }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDragOver={(e) => { e.preventDefault(); ref.current?.classList.add('dragover'); }}
      onDragLeave={() => ref.current?.classList.remove('dragover')}
      onDrop={(e) => {
        e.preventDefault();
        ref.current?.classList.remove('dragover');
        onDropGuest(e.dataTransfer.getData('text/plain'));
      }}
    >
      <div className="table-shape" style={geo.shapeStyle}>
        <button
          className="table-edit"
          title={tableWord}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
        >✎</button>
        <button
          className="table-del"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
        >×</button>
        {name ? `${tb.number}. ${name}` : `${tableWord} ${tb.number}`}
        <span className="cnt">{capTxt}</span>
        {under && <span className="notfull">⚠ {notFilledLabel}</span>}
      </div>
      {chairs.map(({ g, x, y }) => (
        <div
          key={g.id}
          className="chair"
          style={{ left: x, top: y }}
          title={gname(g)}
          draggable
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onDragStart={(e) => { e.stopPropagation(); e.dataTransfer.setData('text/plain', 'chair:' + g.id); }}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); (e.currentTarget as HTMLElement).classList.add('swap-over'); }}
          onDragLeave={(e) => (e.currentTarget as HTMLElement).classList.remove('swap-over')}
          onDrop={(e) => { e.preventDefault(); e.stopPropagation(); (e.currentTarget as HTMLElement).classList.remove('swap-over'); onDropOnChair(e.dataTransfer.getData('text/plain'), g.id); }}
        >
          {gname(g)}<span className="chair-x" onClick={(e) => { e.stopPropagation(); onUnseat(g.id); }}>×</span>
        </div>
      ))}
    </div>
  );
}

/* ===== Guest inline edit ===== */
function GuestEditBox({ guest, onClose }: { guest: Guest; onClose: () => void }) {
  const { lang, tr, update } = useApp();
  const [first, setFirst] = useState(guest.first);
  const [last, setLast] = useState(guest.last);
  const [phone, setPhone] = useState(guest.phone);
  const [address, setAddress] = useState(guest.address || '');
  const [group, setGroup] = useState<GuestGroup>(guest.group);
  const [notes, setNotes] = useState(guest.notes[lang] || guest.notes.en || '');

  const save = () => {
    update((d) => ({
      ...d,
      guests: d.guests.map((g) => {
        if (g.id !== guest.id) return g;
        const n = notes.trim();
        return { ...g, first: first.trim() || g.first, last: last.trim(), phone: phone.trim(), address: address.trim(), group, notes: { en: n, pl: n } };
      }),
    }));
    onClose();
  };

  return (
    <div className="edit-box">
      <div><label>{tr.guests.fFirst}</label><input type="text" value={first} onChange={(e) => setFirst(e.target.value)} style={{ width: '100%' }} /></div>
      <div><label>{tr.guests.fLast}</label><input type="text" value={last} onChange={(e) => setLast(e.target.value)} style={{ width: '100%' }} /></div>
      <div><label>{tr.guests.fPhone}</label><input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%' }} /></div>
      <div><label>{tr.guests.fAddress}</label><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%' }} /></div>
      <div><label>{tr.guests.fGroup}</label>
        <select value={group} onChange={(e) => setGroup(e.target.value as GuestGroup)} style={{ width: '100%' }}>
          {(Object.keys(T.en.guests.groups) as GuestGroup[]).map((gr) => <option key={gr} value={gr}>{tr.guests.groups[gr]}</option>)}
        </select>
      </div>
      <div><label>{tr.guests.fNotes}</label><input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%' }} /></div>
      <div className="full row">
        <button className="btn leaf" onClick={save}>{tr.guests.save}</button>
        <button className="btn sm" onClick={onClose}>{tr.guests.cancel}</button>
      </div>
    </div>
  );
}

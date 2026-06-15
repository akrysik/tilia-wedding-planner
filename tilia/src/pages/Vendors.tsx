import { useState } from 'react';
import { useApp } from '../store';
import { T } from '../i18n';
import type { Vendor } from '../types';

export default function Vendors() {
  const { lang, tr, data, update, toast } = useApp();
  const [editing, setEditing] = useState<number | null>(null);
  const [logDrafts, setLogDrafts] = useState<Record<number, string>>({});

  const setStage = (id: number, i: number) =>
    update((d) => ({ ...d, vendors: d.vendors.map((v) => (v.id === id ? { ...v, stage: i } : v)) }));

  const addLog = (id: number) => {
    const v = (logDrafts[id] || '').trim();
    if (!v) return;
    const dt = new Date();
    const when = String(dt.getDate()).padStart(2, '0') + '.' + String(dt.getMonth() + 1).padStart(2, '0');
    update((d) => ({
      ...d,
      vendors: d.vendors.map((x) => (x.id === id ? { ...x, log: [{ when, en: v, pl: v }, ...x.log] } : x)),
    }));
    setLogDrafts((s) => ({ ...s, [id]: '' }));
  };

  return (
    <>
      <h1 className="page-title">{tr.vendors.title}</h1>
      <p className="page-sub">{tr.vendors.sub}</p>
      <div className="grid vendor-grid">
        {data.vendors.map((v) =>
          editing === v.id ? (
            <VendorEditBox key={v.id} vendor={v} onClose={() => setEditing(null)} />
          ) : (
            <div key={v.id} className="card">
              <div className="spread">
                <div>
                  <span className="chip" style={{ borderColor: 'var(--gold)', color: 'var(--gold)' }}>{v.cat[lang]}</span>
                  <h3 style={{ marginTop: 6 }}>{v.name}</h3>
                  <div className="muted">{v.contact}</div>
                </div>
                <button className="btn sm" onClick={() => setEditing(v.id)}>✎ {tr.vendors.edit}</button>
              </div>
              <div className="pipeline">
                {T[lang].vendors.stages.map((s, i) => (
                  <span key={i} className={i <= v.stage ? 'on' : ''} onClick={() => setStage(v.id, i)}>{s}</span>
                ))}
              </div>
              <hr className="hairline" />
              <div className="muted" style={{ marginBottom: 4 }}><strong>{tr.vendors.notes}:</strong> {v.notes[lang]}</div>
              <div>
                <strong className="muted">{tr.vendors.docs}:</strong>{' '}
                {v.docs.map((doc, i) => <span key={i} className="doc-pill">📄 {doc[lang]}</span>)}
                <button className="btn sm gold" style={{ marginTop: 4 }} onClick={() => toast(tr.vendors.uploaded)}>{tr.vendors.upload}</button>
              </div>
              <hr className="hairline" />
              <strong className="muted">{tr.vendors.log}:</strong>
              {v.log.length ? v.log.map((l, i) => (
                <div key={i} className="log-item"><span className="when">{l.when}</span>{l[lang]}</div>
              )) : <div className="muted log-item">—</div>}
              <div className="row" style={{ marginTop: 8 }}>
                <input type="text" value={logDrafts[v.id] || ''} onChange={(e) => setLogDrafts((s) => ({ ...s, [v.id]: e.target.value }))} placeholder={tr.vendors.logPh} style={{ flex: 1 }} />
                <button className="btn sm" onClick={() => addLog(v.id)}>{tr.vendors.addLog}</button>
              </div>
            </div>
          ),
        )}
      </div>
    </>
  );
}

function VendorEditBox({ vendor, onClose }: { vendor: Vendor; onClose: () => void }) {
  const { lang, tr, update } = useApp();
  const [name, setName] = useState(vendor.name);
  const [cat, setCat] = useState(vendor.cat[lang] || vendor.cat.en);
  const [contact, setContact] = useState(vendor.contact);
  const [notes, setNotes] = useState(vendor.notes[lang] || vendor.notes.en);

  const save = () => {
    update((d) => ({
      ...d,
      vendors: d.vendors.map((v) => {
        if (v.id !== vendor.id) return v;
        const n = name.trim();
        const c = cat.trim();
        const o = notes.trim();
        return { ...v, ...(n ? { name: n } : {}), ...(c ? { cat: { en: c, pl: c } } : {}), contact: contact.trim(), notes: { en: o, pl: o } };
      }),
    }));
    onClose();
  };

  return (
    <div className="card">
      <div className="edit-box" style={{ margin: 0 }}>
        <div><label>{tr.vendors.fName}</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} /></div>
        <div><label>{tr.vendors.fCat}</label><input type="text" value={cat} onChange={(e) => setCat(e.target.value)} style={{ width: '100%' }} /></div>
        <div><label>{tr.vendors.fContact}</label><input type="text" value={contact} onChange={(e) => setContact(e.target.value)} style={{ width: '100%' }} /></div>
        <div><label>{tr.vendors.fNotes}</label><input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%' }} /></div>
        <div className="full row">
          <button className="btn" onClick={save}>{tr.vendors.save}</button>
          <button className="btn sm gold" onClick={onClose}>{tr.vendors.cancel}</button>
        </div>
      </div>
    </div>
  );
}

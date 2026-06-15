import { useEffect, useState } from 'react';
import { useApp } from '../store';
import { SWATCHES } from '../seed';

const PIN_COLORS = ['#A85C68', '#9C8458', '#6E7F5A', '#C77B4F', '#857A9B'];

export default function Inspiration() {
  const { lang, tr, data, update, toast } = useApp();
  const [notes, setNotes] = useState(data.themeNotes[lang]);
  const [pinSeq, setPinSeq] = useState(0);

  // Follow the language toggle: show the notes for the active language.
  useEffect(() => { setNotes(data.themeNotes[lang]); }, [lang, data.themeNotes]);

  const addPin = () => {
    const c = PIN_COLORS[pinSeq % PIN_COLORS.length];
    setPinSeq((n) => n + 1);
    update((d) => ({ ...d, mood: [{ c, en: 'New inspiration pin', pl: 'Nowa inspiracja' }, ...d.mood] }));
  };

  const togglePalette = (c: string) =>
    update((d) => {
      if (d.palette.includes(c)) return { ...d, palette: d.palette.filter((x) => x !== c) };
      if (d.palette.length < 5) return { ...d, palette: [...d.palette, c] };
      return d;
    });

  const saveNotes = () => {
    update((d) => ({ ...d, themeNotes: { ...d.themeNotes, [lang]: notes } }));
    toast(tr.insp.saved);
  };

  return (
    <>
      <h1 className="page-title">{tr.insp.title}</h1>
      <p className="page-sub">{tr.insp.sub}</p>
      <div className="card">
        <div className="spread mb"><h3>{tr.insp.board}</h3><button className="btn" onClick={addPin}>{tr.insp.addPin}</button></div>
        <div className="mood-grid">
          {data.mood.map((m, i) => (
            <div key={i} className="mood-tile" style={{ background: m.c, minHeight: 90 + (i % 3) * 36 }}>
              {m[lang]}<small>{m.c}</small>
            </div>
          ))}
        </div>
      </div>
      <div className="card mt">
        <h3 className="mb">{tr.insp.palette}</h3>
        <p className="muted mb">{tr.insp.paletteHint}</p>
        <div className="swatch-row">
          {SWATCHES.map((c) => (
            <div
              key={c}
              className={`swatch ${data.palette.includes(c) ? 'picked' : ''}`}
              style={{ background: c, ...(c === '#FFFFFF' ? { border: '1.5px solid var(--line)' } : {}) }}
              onClick={() => togglePalette(c)}
            />
          ))}
        </div>
        <div className="muted mt" style={{ fontWeight: 700 }}>{tr.insp.yourPalette}:</div>
        <div className="palette-strip">{data.palette.map((c, i) => <div key={i} style={{ background: c }}>{c}</div>)}</div>
      </div>
      <div className="card mt">
        <div className="spread mb">
          <h3>{tr.insp.theme}</h3>
          <div className="row">
            <button className="btn sm gold" onClick={saveNotes}>{tr.insp.save}</button>
            <button className="btn sm" onClick={() => toast(tr.insp.sharedTheme)}>{tr.insp.shareTheme}</button>
          </div>
        </div>
        <textarea rows={4} style={{ width: '100%' }} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
    </>
  );
}

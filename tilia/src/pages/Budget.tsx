import { useState } from 'react';
import { useApp } from '../store';
import { PIE_COLORS } from '../seed';
import type { Expense } from '../types';

export default function Budget() {
  const { lang, tr, data, update, toast, money, catName } = useApp();
  const [editing, setEditing] = useState<number | null>(null);
  const [newCat, setNewCat] = useState('');
  const [expName, setExpName] = useState('');
  const [expCat, setExpCat] = useState(data.budget.cats[0]?.key || '');
  const [expAmt, setExpAmt] = useState('');
  const [expStatus, setExpStatus] = useState<'pending' | 'paid'>('pending');

  const catTotals = (key: string) => {
    const exp = data.budget.expenses.filter((e) => e.cat === key);
    const act = exp.reduce((s, e) => s + e.amt, 0);
    const paid = exp.filter((e) => e.paid).reduce((s, e) => s + e.amt, 0);
    return { act, paid, pending: act - paid };
  };

  const estT = data.budget.cats.reduce((s, c) => s + c.est, 0);
  const actT = data.budget.expenses.reduce((s, e) => s + e.amt, 0);
  const paidT = data.budget.expenses.filter((e) => e.paid).reduce((s, e) => s + e.amt, 0);

  const addCat = () => {
    const v = newCat.trim();
    if (!v) return;
    update((d) => ({ ...d, budget: { ...d.budget, cats: [...d.budget.cats, { key: 'c' + Date.now(), en: v, pl: v, est: 0 }] } }));
    setNewCat('');
    toast(tr.budget.catAdded);
  };
  const addExpense = () => {
    const name = expName.trim();
    const amt = +expAmt;
    if (!name || !amt) return;
    update((d) => ({ ...d, budget: { ...d.budget, expenses: [...d.budget.expenses, { id: Date.now(), name: { en: name, pl: name }, cat: expCat, amt, paid: expStatus === 'paid' }] } }));
    setExpName(''); setExpAmt('');
  };
  const payExpense = (id: number) =>
    update((d) => ({ ...d, budget: { ...d.budget, expenses: d.budget.expenses.map((e) => (e.id === id ? { ...e, paid: true } : e)) } }));

  /* charts */
  const rows = data.budget.cats.map((c) => ({ c, tt: catTotals(c.key) })).filter((r) => r.tt.act > 0 || r.c.est > 0);
  const spenders = rows.filter((r) => r.tt.act > 0);
  let acc = 0;
  const stops = spenders.map((r, j) => {
    const pctv = (r.tt.act / actT) * 100;
    const col = PIE_COLORS[j % PIE_COLORS.length];
    const seg = `${col} ${acc}% ${acc + pctv}%`;
    acc += pctv;
    return seg;
  }).join(', ');
  const maxV = Math.max(...rows.map((r) => Math.max(r.c.est, r.tt.act)), 1);

  return (
    <>
      <h1 className="page-title">{tr.budget.title}</h1>
      <p className="page-sub">{tr.budget.sub}</p>
      <div className="grid budget-stats">
        <div className="card"><div className="muted">{tr.budget.total}</div><div className="stat-num">{money(data.budget.total)}</div></div>
        <div className="card"><div className="muted">{tr.budget.estimated}</div><div className="stat-num">{money(estT)}</div></div>
        <div className="card"><div className="muted">{tr.budget.actual}</div><div className="stat-num">{money(actT)}</div></div>
        <div className="card"><div className="muted">{tr.budget.paidS}</div><div className="stat-num" style={{ color: 'var(--leaf)' }}>{money(paidT)}</div></div>
        <div className="card"><div className="muted">{tr.budget.pendingS}</div><div className="stat-num" style={{ color: 'var(--gold)' }}>{money(actT - paidT)}</div></div>
      </div>

      <div className="grid mt charts-grid">
        <div className="card">
          <h3 className="mb">{tr.budget.byCat}</h3>
          <div className="row" style={{ gap: 28, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', minHeight: 200 }}>
            <div className="donut" style={{ background: `conic-gradient(${stops})` }}>
              <div className="hole"><div className="stat-num">{money(actT)}</div><div className="muted" style={{ fontSize: 10.5 }}>{tr.budget.spentLbl}</div></div>
            </div>
            <div className="dlegend">
              {spenders.map((r, j) => (
                <div key={r.c.key}><span className="sw" style={{ background: PIE_COLORS[j % PIE_COLORS.length] }} />{catName(r.c)} · <strong>{Math.round((r.tt.act / actT) * 100)}%</strong> <span className="muted">({money(r.tt.act)})</span></div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <h3 className="mb">{tr.budget.estVsAct}</h3>
          <div className="chart-leg">
            <span><span className="sw" style={{ background: '#CBB98F' }} />{tr.budget.legEst}</span>
            <span><span className="sw" style={{ background: 'var(--accent)' }} />{tr.budget.legAct}</span>
            <span><span className="sw" style={{ background: 'var(--rose)' }} />{tr.budget.legAct} &gt; {tr.budget.legEst}</span>
          </div>
          {rows.map((r) => (
            <div key={r.c.key} className="brow">
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}>{catName(r.c)}</span>
              <div className="btrack">
                <div className="bbar est" style={{ width: `${(r.c.est / maxV) * 100}%` }} title={`${tr.budget.legEst}: ${money(r.c.est)}`} />
                <div className={`bbar act ${r.tt.act > r.c.est ? 'overb' : ''}`} style={{ width: `${(r.tt.act / maxV) * 100}%` }} title={`${tr.budget.legAct}: ${money(r.tt.act)}`} />
              </div>
              <div className="bvals"><span className="muted">{money(r.c.est)}</span><br /><strong className={r.tt.act > r.c.est ? 'over' : 'under'}>{money(r.tt.act)}</strong></div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt">
        <table className="budget-table">
          <tbody>
            <tr><th>{tr.budget.cat}</th><th className="num">{tr.budget.est}</th><th className="num">{tr.budget.act}</th><th className="num">{tr.budget.paid}</th><th className="num">{tr.budget.pending}</th></tr>
            {data.budget.cats.map((c) => {
              const tt = catTotals(c.key);
              const overEst = tt.act > c.est;
              return (
                <tr key={c.key}>
                  <td>{catName(c)}</td>
                  <td className="num">{money(c.est)}</td>
                  <td className={`num ${overEst ? 'over' : ''}`}>{money(tt.act)}</td>
                  <td className="num under">{money(tt.paid)}</td>
                  <td className={`num ${tt.pending > 0 ? 'pend' : ''}`}>{money(tt.pending)}</td>
                </tr>
              );
            })}
            <tr style={{ fontWeight: 700 }}>
              <td>{tr.budget.totalRow}</td>
              <td className="num">{money(estT)}</td>
              <td className="num">{money(actT)}</td>
              <td className="num under">{money(paidT)}</td>
              <td className="num pend">{money(actT - paidT)}</td>
            </tr>
          </tbody>
        </table>
        <hr className="hairline" />
        <div className="row">
          <input type="text" value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder={tr.budget.catPh} style={{ flex: 1, minWidth: 160 }} />
          <button className="btn gold" onClick={addCat}>{tr.budget.addCat}</button>
        </div>
      </div>

      <div className="card mt">
        <h3 className="mb">{tr.budget.expenses}</h3>
        {data.budget.expenses.slice().reverse().map((e) => {
          const c = data.budget.cats.find((c) => c.key === e.cat);
          if (editing === e.id) return <ExpenseEditBox key={e.id} expense={e} onClose={() => setEditing(null)} />;
          return (
            <div key={e.id} className="exp-row">
              <div><strong>{e.name[lang] || e.name.en}</strong>{e.note?.[lang] && <div className="muted">📝 {e.note[lang]}</div>}</div>
              <span className="muted">{c ? catName(c) : '—'}</span>
              <span style={{ textAlign: 'right', fontWeight: 700 }}>{money(e.amt)}</span>
              <span style={{ textAlign: 'right' }}>
                {e.paid
                  ? <span className="chip" style={{ borderColor: 'var(--leaf)', color: 'var(--leaf)' }}>{tr.budget.stPaid} ✓</span>
                  : <button className="btn sm leaf" onClick={() => payExpense(e.id)}>{tr.budget.markPaid}</button>}
              </span>
              <span style={{ textAlign: 'right' }}><button className="btn sm" onClick={() => setEditing(e.id)}>✎ {tr.budget.edit}</button></span>
            </div>
          );
        })}
        <hr className="hairline" />
        <div className="form-grid">
          <input type="text" value={expName} onChange={(e) => setExpName(e.target.value)} placeholder={tr.budget.expName} />
          <select value={expCat} onChange={(e) => setExpCat(e.target.value)}>{data.budget.cats.map((c) => <option key={c.key} value={c.key}>{catName(c)}</option>)}</select>
          <input type="number" value={expAmt} onChange={(e) => setExpAmt(e.target.value)} placeholder={tr.budget.amount} />
          <select value={expStatus} onChange={(e) => setExpStatus(e.target.value as 'pending' | 'paid')}>
            <option value="pending">{tr.budget.stPending}</option>
            <option value="paid">{tr.budget.stPaid}</option>
          </select>
          <button className="btn" onClick={addExpense}>{tr.budget.addExpense}</button>
        </div>
      </div>
    </>
  );
}

function ExpenseEditBox({ expense, onClose }: { expense: Expense; onClose: () => void }) {
  const { lang, tr, data, update, catName } = useApp();
  const [name, setName] = useState(expense.name[lang] || expense.name.en);
  const [amt, setAmt] = useState(String(expense.amt));
  const [cat, setCat] = useState(expense.cat);
  const [paid, setPaid] = useState(expense.paid);
  const [note, setNote] = useState(expense.note?.[lang] || '');

  const save = () => {
    update((d) => ({
      ...d,
      budget: {
        ...d.budget,
        expenses: d.budget.expenses.map((e) => {
          if (e.id !== expense.id) return e;
          const n = name.trim();
          const a = +amt;
          const o = note.trim();
          return { ...e, ...(n ? { name: { en: n, pl: n } } : {}), ...(a > 0 ? { amt: a } : {}), cat, paid, note: { en: o, pl: o } };
        }),
      },
    }));
    onClose();
  };
  const del = () => {
    update((d) => ({ ...d, budget: { ...d.budget, expenses: d.budget.expenses.filter((e) => e.id !== expense.id) } }));
    onClose();
  };

  return (
    <div className="edit-box" style={{ margin: '8px 0' }}>
      <div><label>{tr.budget.fExpName}</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%' }} /></div>
      <div><label>{tr.budget.fAmount}</label><input type="number" value={amt} onChange={(e) => setAmt(e.target.value)} style={{ width: '100%' }} /></div>
      <div><label>{tr.budget.cat}</label><select value={cat} onChange={(e) => setCat(e.target.value)} style={{ width: '100%' }}>{data.budget.cats.map((c) => <option key={c.key} value={c.key}>{catName(c)}</option>)}</select></div>
      <div><label>{tr.budget.status}</label>
        <select value={paid ? 'paid' : 'pending'} onChange={(e) => setPaid(e.target.value === 'paid')} style={{ width: '100%' }}>
          <option value="pending">{tr.budget.stPending}</option>
          <option value="paid">{tr.budget.stPaid}</option>
        </select>
      </div>
      <div className="full"><label>{tr.budget.fNote}</label><input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder={tr.budget.notePh} style={{ width: '100%' }} /></div>
      <div className="full row">
        <button className="btn" onClick={save}>{tr.budget.save}</button>
        <button className="btn sm gold" onClick={onClose}>{tr.budget.cancel}</button>
        <button className="btn sm danger" onClick={del}>🗑 {tr.budget.delExp}</button>
      </div>
    </div>
  );
}

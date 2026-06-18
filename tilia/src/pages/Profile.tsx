import { useEffect, useState } from 'react';
import { useApp } from '../store';

export default function Profile() {
  const { tr, data, update, toast } = useApp();
  const w = data.wedding;

  const [bride, setBride] = useState(w.brideName);
  const [groom, setGroom] = useState(w.groomName);
  const [date, setDate] = useState(w.date);
  const [time, setTime] = useState(w.time);
  const [venue, setVenue] = useState(w.venue);
  const [budget, setBudget] = useState(String(data.budget.total));
  const [email, setEmail] = useState(w.contactEmail);
  const [phone, setPhone] = useState(w.contactPhone);

  // Keep the form in sync if the underlying data changes (e.g. language switch
  // doesn't change these, but switching accounts/demo would remount anyway).
  useEffect(() => {
    setBride(w.brideName); setGroom(w.groomName); setDate(w.date); setTime(w.time);
    setVenue(w.venue); setBudget(String(data.budget.total)); setEmail(w.contactEmail); setPhone(w.contactPhone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const p = tr.profile;

  const save = () => {
    const total = Math.max(0, Math.round(+budget) || 0);
    update((d) => ({
      ...d,
      wedding: {
        brideName: bride.trim(),
        groomName: groom.trim(),
        date: date || d.wedding.date,
        time: /^\d{1,2}:\d{2}$/.test(time.trim()) ? time.trim().padStart(5, '0') : d.wedding.time,
        venue: venue.trim(),
        contactEmail: email.trim(),
        contactPhone: phone.trim(),
      },
      budget: { ...d.budget, total },
    }));
    toast(p.saved);
  };

  return (
    <>
      <div className="spread">
        <div>
          <h1 className="page-title">{p.title}</h1>
          <p className="page-sub">{p.sub}</p>
        </div>
        <button className="btn" onClick={save}>{p.save}</button>
      </div>

      <div className="card mb">
        <h3 className="mb">{p.couple}</h3>
        <div className="profile-form">
          <div><label>{p.bride}</label><input type="text" value={bride} placeholder={p.bridePh} onChange={(e) => setBride(e.target.value)} /></div>
          <div><label>{p.groom}</label><input type="text" value={groom} placeholder={p.groomPh} onChange={(e) => setGroom(e.target.value)} /></div>
        </div>
      </div>

      <div className="card mb">
        <h3 className="mb">{p.whenWhere}</h3>
        <div className="profile-form">
          <div><label>{p.date}</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><label>{p.time}</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
          <div className="full"><label>{p.venue}</label><input type="text" value={venue} placeholder={p.venuePh} onChange={(e) => setVenue(e.target.value)} /></div>
        </div>
      </div>

      <div className="card mb">
        <h3 className="mb">{p.budgetSec}</h3>
        <div className="profile-form">
          <div><label>{p.totalBudget}</label><input type="number" min={0} value={budget} onChange={(e) => setBudget(e.target.value)} /></div>
        </div>
      </div>

      <div className="card mb">
        <h3 className="mb">{p.contact}</h3>
        <div className="profile-form">
          <div><label>{p.cEmail}</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label>{p.cPhone}</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        </div>
      </div>

      <button className="btn" onClick={save}>{p.save}</button>
    </>
  );
}

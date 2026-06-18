import { NavLink } from 'react-router-dom';
import { useApp } from '../store';
import { formatWeddingDate } from '../format';

const NAV: [string, string, string][] = [
  ['/', '◆', 'dashboard'],
  ['/planning', '✓', 'planning'],
  ['/budget', '¤', 'budget'],
  ['/guests', '♥', 'guests'],
  ['/vendors', '✦', 'vendors'],
  ['/inspiration', '❀', 'inspiration'],
];

export default function Sidebar() {
  const { tr, lang, data } = useApp();
  const w = data.wedding;
  const tagline = `${w.brideName} & ${w.groomName} · ${formatWeddingDate(w.date, lang)}`;
  return (
    <aside>
      <div className="brand">Tilia<em>.</em></div>
      <div className="tagline">{tagline}</div>
      <nav>
        {NAV.map(([path, ico, key]) => (
          <NavLink key={key} to={path} end={path === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
            <span className="ico">{ico}</span>
            {tr.nav[key as keyof typeof tr.nav]}
          </NavLink>
        ))}
      </nav>
      <div className="aside-foot">{tr.foot}</div>
    </aside>
  );
}

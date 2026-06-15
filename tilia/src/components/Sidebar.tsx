import { NavLink } from 'react-router-dom';
import { useApp } from '../store';

const NAV: [string, string, string][] = [
  ['/', '◆', 'dashboard'],
  ['/planning', '✓', 'planning'],
  ['/budget', '¤', 'budget'],
  ['/guests', '♥', 'guests'],
  ['/vendors', '✦', 'vendors'],
  ['/inspiration', '❀', 'inspiration'],
];

export default function Sidebar() {
  const { tr } = useApp();
  return (
    <aside>
      <div className="brand">Tilia<em>.</em></div>
      <div className="tagline">{tr.tagline}</div>
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

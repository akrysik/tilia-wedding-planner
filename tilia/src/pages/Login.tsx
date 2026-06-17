import { useState } from 'react';
import { useApp } from '../store';

export default function Login() {
  const { lang, setLang, tr, signIn, signUp, enterDemo, toast } = useApp();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const a = tr.auth;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setInfo('');
    if (!email.trim() || !password) { setError(a.errEmpty); return; }
    if (mode === 'up' && password.length < 6) { setError(a.errShortPw); return; }
    setBusy(true);
    try {
      if (mode === 'in') {
        const { error } = await signIn(email, password);
        if (error) setError(error);
        else toast(a.signedIn); // onAuthStateChange swaps to the app
      } else {
        const { error, needsConfirm } = await signUp(email, password);
        if (error) setError(error);
        else if (needsConfirm) setInfo(a.needConfirm);
        else toast(a.accountCreated);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-card">
        <div className="lang-switch" style={{ margin: '0 auto 18px' }}>
          <button className={lang === 'pl' ? 'active' : ''} onClick={() => setLang('pl')}>PL</button>
          <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
        </div>
        <div className="brand" style={{ fontSize: 30 }}>Tilia<em>.</em></div>
        <h2>{mode === 'in' ? a.welcomeIn : a.welcomeUp}</h2>
        <div className="sub">{mode === 'in' ? a.subIn : a.subUp}</div>

        <div className="auth-tabs">
          <button className={mode === 'in' ? 'active' : ''} onClick={() => { setMode('in'); setError(''); setInfo(''); }}>{a.signInTab}</button>
          <button className={mode === 'up' ? 'active' : ''} onClick={() => { setMode('up'); setError(''); setInfo(''); }}>{a.signUpTab}</button>
        </div>

        <form onSubmit={submit}>
          <input type="email" autoComplete="email" placeholder={a.email} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            type="password"
            autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
            placeholder={a.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === 'up' && <div className="auth-hint">{a.pwHint}</div>}
          {error && <div className="auth-msg err">{error}</div>}
          {info && <div className="auth-msg ok">{info}</div>}
          <button className="btn" type="submit" disabled={busy}>
            {busy ? a.working : mode === 'in' ? a.signInBtn : a.signUpBtn}
          </button>
        </form>

        <button className="alt" onClick={() => toast(tr.top.soon)}>G&nbsp;&nbsp;{a.google}</button>

        <div className="auth-switch">
          {mode === 'in' ? (
            <>{a.noAccount} <button onClick={() => { setMode('up'); setError(''); setInfo(''); }}>{a.switchToUp}</button></>
          ) : (
            <>{a.haveAccount} <button onClick={() => { setMode('in'); setError(''); setInfo(''); }}>{a.switchToIn}</button></>
          )}
        </div>

        <div className="auth-or"><span>{a.or}</span></div>

        <button className="btn gold demo-btn" onClick={enterDemo}>{a.demo}</button>
        <div className="auth-hint" style={{ marginTop: 6 }}>{a.demoSub}</div>
      </div>
    </div>
  );
}

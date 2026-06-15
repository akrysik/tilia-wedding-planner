import { useApp } from '../store';

export default function LoginOverlay() {
  const { tr, setLoggedIn, toast } = useApp();
  const doLogin = () => { setLoggedIn(true); toast(tr.top.signedIn); };
  return (
    <div className="login-overlay">
      <div className="login-card">
        <div className="brand" style={{ fontSize: 30 }}>Tilia<em>.</em></div>
        <h2>{tr.top.welcome}</h2>
        <div className="sub">{tr.top.loginSub}</div>
        <input type="text" placeholder={tr.top.email} defaultValue="ania.k@example.com" />
        <input type="password" placeholder={tr.top.password} defaultValue="••••••••" />
        <button className="btn" onClick={doLogin}>{tr.top.signin}</button>
        <button className="alt" onClick={doLogin}>G&nbsp;&nbsp;{tr.top.google}</button>
      </div>
    </div>
  );
}

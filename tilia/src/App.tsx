import { Navigate, Route, Routes } from 'react-router-dom';
import { useApp } from './store';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Planning from './pages/Planning';
import Budget from './pages/Budget';
import Guests from './pages/Guests';
import Vendors from './pages/Vendors';
import Inspiration from './pages/Inspiration';
import Profile from './pages/Profile';

export default function App() {
  const { identity, toastMsg } = useApp();

  // Still resolving the session.
  if (identity === undefined) {
    return (
      <div className="login-overlay">
        <div className="brand" style={{ fontSize: 34 }}>Tilia<em>.</em></div>
      </div>
    );
  }

  // Logged out → login screen (with demo entry point).
  if (identity === null) {
    return (
      <>
        <Login />
        {toastMsg && <div className="toast">{toastMsg}</div>}
      </>
    );
  }

  return (
    <>
      <Sidebar />
      <div className="main-col">
        <Topbar />
        <main>
          <div className="section">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/planning" element={<Planning />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/guests" element={<Guests />} />
              <Route path="/vendors" element={<Vendors />} />
              <Route path="/inspiration" element={<Inspiration />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>
      {toastMsg && <div className="toast">{toastMsg}</div>}
    </>
  );
}

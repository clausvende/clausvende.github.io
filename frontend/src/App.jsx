import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ClientList from './components/ClientList';
import AddClient from './components/AddClient';
import ClientDetails from './components/ClientDetails';
import Report from './components/Report';
import { AuthProvider, useAuth } from './AuthProvider';
import Login from './Login';
import './App.css';

function MainRoutes() {
  const { user, role, logout } = useAuth();
  if (!user) return <Login />;

  return (
    <>
      <header className="header">
        <span>{user.displayName} - {role}</span>
        <button onClick={logout}>Cerrar sesión</button>
      </header>
      <nav>
        <Link to="/">Clientes</Link>
        <Link to="/add">Nuevo cliente</Link>
        <Link to="/report">Reporte</Link>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<ClientList />} />
          <Route path="/add" element={<AddClient />} />
          <Route path="/client/:id" element={<ClientDetails />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainRoutes />
      </Router>
    </AuthProvider>
  );
}

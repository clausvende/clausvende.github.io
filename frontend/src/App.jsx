import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ClientList from './components/ClientList';
import AddClient from './components/AddClient';
import ClientDetails from './components/ClientDetails';
import Report from './components/Report';
import './App.css';

export default function App() {
  return (
    <Router>
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
    </Router>
  );
}

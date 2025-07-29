import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import AddClient from './AddClient';
import Modal from './Modal';
import AccountStatement from './AccountStatement';

export default function ClientList({ go }) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [show, setShow] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [statementId, setStatementId] = useState(null);

  const fetchClients = async () => {
    const snapshot = await getDocs(collection(db, 'clients'));
    setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const removeClient = async c => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    await deleteDoc(doc(db, 'clients', c.id));
    fetchClients();
  };

  return (
    <div>
      <button onClick={() => setShow(true)}>Nuevo cliente</button>
      <input
        placeholder="Buscar cliente"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <ul className="list">
        {filtered.map(c => {
          const cleanPhone = (c.phone || '').replace(/\D/g, '');
          return (
            <li key={c.id}>
              <span className="name">{c.name} - deuda: ${c.balance || 0}</span>
              <span className="actions">
                <button onClick={() => go('client', c.id)}>👁️</button>
                <button onClick={() => setStatementId(c.id)}>📄</button>
                {cleanPhone && (
                  <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noopener noreferrer">💬</a>
                )}
                <button onClick={() => setEditClient(c)}>✏️</button>
                <button onClick={() => removeClient(c)}>🗑️</button>
              </span>
            </li>
          );
        })}
      </ul>
      {show && (
        <Modal onClose={() => setShow(false)}>
          <AddClient onDone={() => { setShow(false); fetchClients(); }} />
        </Modal>
      )}
      {editClient && (
        <Modal onClose={() => setEditClient(null)}>
          <AddClient client={editClient} onDone={() => { setEditClient(null); fetchClients(); }} />
        </Modal>
      )}
      {statementId && (
        <Modal onClose={() => setStatementId(null)}>
          <AccountStatement clientId={statementId} />
        </Modal>
      )}
    </div>
  );
}

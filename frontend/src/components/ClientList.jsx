import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import AddClient from './AddClient';
import Modal from './Modal';

export default function ClientList({ go }) {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      const snapshot = await getDocs(collection(db, 'clients'));
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchClients();
  }, []);

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <button onClick={() => setShow(true)}>Nuevo cliente</button>
      <input
        placeholder="Buscar cliente"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <ul className="list">
        {filtered.map(c => (
          <li key={c.id}>
            <button onClick={() => go('client', c.id)}>{c.name}</button> - deuda: ${c.balance || 0}
          </li>
        ))}
      </ul>
      {show && (
        <Modal onClose={() => setShow(false)}>
          <AddClient onDone={() => setShow(false)} />
        </Modal>
      )}
    </div>
  );
}
